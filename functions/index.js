const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

// === Nodemailer Setup ===
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rccoleman19@gmail.com",
    pass: "upgkxffikkcuepdo",
  },
});

// === New Booking Notification ===
exports.notifyNewBooking = functions.firestore
  .document("bookings/{bookingId}")
  .onCreate(async (snap, ctx) => {
    const data = snap.data();
    const bookingId = ctx.params.bookingId;
    const userEmail = data.email || "";

    await snap.ref.update({ status: "pending" });

    let name = "N/A";
    let phone = "N/A";

    if (userEmail) {
      try {
        const userSnap = await db.collection("users").doc(userEmail).get();
        if (userSnap.exists) {
          const userData = userSnap.data();
          name = userData.name || "N/A";
          phone = userData.phone || "N/A";
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    }

    const aLink = "https://us-central1-bellagio-marrone.cloudfunctions.net/approveBooking?id=" + bookingId;
    const dLink = "https://us-central1-bellagio-marrone.cloudfunctions.net/denyBooking?id=" + bookingId;

    let estimatedCost = "Unavailable";
    try {
      const arrival = new Date(data["arrive date"]);
      const departure = new Date(data["leave date"]);
      const nights = Math.ceil((departure - arrival) / (1000 * 60 * 60 * 24));
      if (nights > 0) {
        estimatedCost = `$${(nights * 200 + 300).toLocaleString()}`;
      }
    } catch (e) {
      console.error("Cost calculation error:", e);
    }

    await transporter.sendMail({
      from: "rccoleman19@gmail.com",
      to: "rccoleman19@gmail.com",
      subject: `${name}`,
      html: `
        <h3>New Booking Submitted</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <hr>
        <p><strong>Arrival:</strong> ${data["arrive date"]}</p>
        <p><strong>Departure:</strong> ${data["leave date"]}</p>
        <p><strong>Estimated Cost:</strong> ${estimatedCost}</p>
        <p>Status: Pending Approval</p>
        <p>
          <a href="${aLink}" style="color:green;font-weight:bold;">✅ Approve</a>
          &nbsp;|&nbsp;
          <a href="${dLink}" style="color:red;font-weight:bold;">❌ Deny</a>
        </p>`
    });
  });

exports.approveBooking = functions.https.onRequest(async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).send("Missing booking ID.");

  const ref = db.collection("bookings").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).send("Booking not found.");

  const data = snap.data();
  const email = data.email;
  const arrive = data["arrive date"];
  const leave = data["leave date"];

  // 🧠 Lookup name from 'users' collection instead of relying on booking data
  let name = "Guest";
  try {
    const userSnap = await db.collection("users").doc(email).get();
    if (userSnap.exists) {
      const userData = userSnap.data();
      name = userData.name || "Guest";
    }
  } catch (error) {
    console.error("Error fetching user name from users collection:", error);
  }

  // ✅ Update Firestore with name and approval
  await ref.update({
    status: "approved",
    name: name,
  });

  // 2. Send confirmation email to the guest
  if (email) {
    await transporter.sendMail({
      from: "rccoleman19@gmail.com",
      to: email,
      subject: "✅ Your Booking is Approved at DB Villa!",
      html: `
        <p>Hi ${name},</p>
        <p>We're excited to confirm that your booking at <strong>DB Villa</strong> has been approved!</p>

        <h3>Booking Details:</h3>
        <ul>
          <li><strong>House Address:</strong>43 Golf Villa Drive, Santa Rosa Beach, FL 32459</li>
          <li><strong>Arrival Date:</strong> ${arrive}</li>
          <li><strong>Departure Date:</strong> ${leave}</li>
        </ul>

        <h3>Important Information:</h3>
        <ul>
          <li>🚫 <strong>No pets are allowed</strong> on the property or pool area.</li>
          <li>🚫 <strong>No smoking allowed</strong> on the property or pool area.</li>
          <li>🔐 <strong>Pool Gate Code:</strong> C3259 </li>
          <li>🕓 Check-in time: 4:00 PM</li>
          <li>🕙 Check-out time: 10:00 AM</li>
          <li>🔇 Quiet hours: 10:00 PM - 7:00 AM</li>
        </ul>
        <h3>Before You Leave:</h3>
        <ul>
          <li>Place all used towels in the laundry hamper or designated bin.</li>
          <li>Remove all food items from the refrigerator.</li>
          <li>Dispose of trash in the outdoor bins.</li>
          <li>Ensure all doors are locked upon departure.</li>
        </ul>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Enjoy your stay at DB Villa!</p>
        <br>
        — DB Villa Team
      `
    });
  }

  res.send("✅ Booking approved and confirmation sent to guest!");
});
exports.denyBooking = functions.https.onRequest(async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).send("Missing booking ID.");
  await db.collection("bookings").doc(id).update({ status: "denied" });
  res.send("❌ Booking denied!");
});

// === Signup Request ===
exports.signupRequest = functions.firestore
  .document("signup_requests/{requestId}")
  .onCreate(async (snap, ctx) => {
    const data = snap.data();
    const email = data.email || "N/A";
    const firstName = data.firstName || "N/A";
    const lastName = data.lastName || "N/A";
    const address = data.address || "N/A";
    const id = ctx.params.requestId;

    const aUrl = "https://us-central1-bellagio-marrone.cloudfunctions.net/approveRequest?id=" + id;
    const dUrl = "https://us-central1-bellagio-marrone.cloudfunctions.net/denyRequest?id=" + id;

    await transporter.sendMail({
      from: "rccoleman19@gmail.com",
      to: "rccoleman19@gmail.com",
      subject: "🔔 New Access Request",
      html: `
        <p><strong>New Access Request Details:</strong></p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Name:</strong> ${firstName} ${lastName}</li>
          <li><strong>Address:</strong> ${address}</li>
        </ul>
        <p>
          <a href="${aUrl}" style="color:green;font-weight:bold;">✅ Approve</a>
          &nbsp;|&nbsp;
          <a href="${dUrl}" style="color:red;font-weight:bold;">❌ Deny</a>
        </p>`
    });
  });

// === Approve/Deny Signup ===
exports.approveRequest = functions.https.onRequest(async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).send("Missing request ID.");

  const ref = db.collection("signup_requests").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).send("Request not found.");

  const data = snap.data();
  const email = data.email;
  const firstName = data.firstName || "N/A";
  const lastName = data.lastName || "N/A";
  const phone = data.phone || "N/A";
  const address = data.address || "N/A";

  await ref.update({ status: "approved" });

  await db.collection("users").doc(email).set({
    name: `${firstName} ${lastName}`,
    email: email,
    phone: phone,
    address: address
  });

  try {
    await admin.auth().createUser({ email });
  } catch (e) {
    if (e.code !== "auth/email-already-exists") throw e;
  }

  const actionCodeSettings = {
    url: "https://www.bellagiomarrone.com/index.html",
    handleCodeInApp: false,
  };
  const resetLink = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);

  await transporter.sendMail({
    from: "rccoleman19@gmail.com",
    to: email,
    subject: "🎉 Your Access Request Approved",
    html: `
      <p>Hi,</p>
      <p>Your access request has been <strong>approved</strong>.</p>
      <p><a href="${resetLink}">Set your password</a> to complete setup.</p>`
  });

  res.send("✅ Request approved & email sent!");
});

exports.denyRequest = functions.https.onRequest(async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).send("Missing request ID.");

  const ref = db.collection("signup_requests").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).send("Request not found.");

  const email = snap.data().email;
  await ref.update({ status: "denied" });

  await transporter.sendMail({
    from: "rccoleman19@gmail.com",
    to: email,
    subject: "❌ Your Access Request Denied",
    html: `<p>Hi,</p><p>Your access request was denied.</p>`
  });

  res.send("❌ Request denied & user notified.");
});

// === Notify Users of denial ===
exports.notifyUserBookingDenied = functions.firestore
  .document("bookings/{bookingId}")
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== "denied" && after.status === "denied") {
      const email = after.email;
      const name = after.name || "Guest";

      if (!email) return;

      await transporter.sendMail({
        from: "rccoleman19@gmail.com",
        to: email,
        subject: "❌ Your Booking was Denied",
        html: `
          <p>Hi ${name},</p>
          <p>Unfortunately, your booking request was <strong>denied</strong>.</p>
          <p>If you believe this is a mistake, feel free to reach out.</p>`
      });
    }
  });

// === Public Reset Link Handler ===
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.post("/", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    const link = await admin.auth().generatePasswordResetLink(email);

    await transporter.sendMail({
      from: "rccoleman19@gmail.com",
      to: email,
      subject: "🔐 Password Reset Request",
      html: `
        <p>Hi there,</p>
        <p>You requested a password reset. Click below to reset your password:</p>
        <p><a href="${link}">Reset Password</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>`
    });

    return res.status(200).json({ success: true, link });
  } catch (error) {
    console.error("Error generating reset link or sending email:", error);
    return res.status(500).json({ error: error.message });
  }
});

exports.sendCustomPasswordReset = functions.https.onRequest(app);
