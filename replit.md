# Bellagio Marrone - Beach House Calendar

## Overview
A static website for managing beach house bookings with Firebase authentication and Firestore database integration.

## Project Structure
- `Bellagio Marrone/public/` - Main website files served to users
  - `index.html` - Login page with Firebase authentication
  - `calendar.html` - Booking calendar with FullCalendar integration
  - `backgroundimage.jpg` - Background image
  - `404.html` - Error page
- `Bellagio Marrone/functions/` - Firebase Cloud Functions (not used in local environment)
- `Bellagio Marrone/firebase.json` - Firebase configuration

## Technology Stack
- Static HTML/CSS/JavaScript
- Firebase Authentication
- Firebase Firestore
- FullCalendar library for calendar display

## Running Locally
The site is served using `npx serve` on port 5000:
```
npx serve "Bellagio Marrone/public" -l 5000
```

## Firebase Configuration
The app uses Firebase for:
- User authentication (email/password)
- Firestore database for bookings and user data
- Cloud Functions for password reset emails

## Features
- User login/signup with Firebase Auth
- Booking calendar with date selection
- Photo gallery of the beach house
- Address/directions integration with Apple Maps, Google Maps, and Waze
