# Bellagio Marrone - Beach House Calendar

## Overview
A static website for managing beach house bookings with Firebase authentication and Firestore database integration. Features a modern, clean design with smooth user experience.

## Project Structure
- `index.html` - Login page with Firebase authentication
- `calendar.html` - Booking calendar with FullCalendar integration
- `backgroundimage.jpg` - Background image
- `404.html` - Error page
- `functions/` - Firebase Cloud Functions (deployed to Firebase, not run locally)
- `firebase.json` - Firebase hosting configuration
- `photo1-6.jpg`, `HouseMap1-2.webp` - Gallery images

## Technology Stack
- Static HTML/CSS/JavaScript
- Firebase Authentication (email/password)
- Firebase Firestore (bookings, users, signup_requests)
- FullCalendar library for calendar display
- Inter font (Google Fonts) for modern typography

## Running Locally
The site is served using `npx serve` on port 5000:
```
npx serve . -l 5000
```

## Firebase Configuration
The app uses Firebase for:
- User authentication (email/password)
- Firestore database for bookings and user data
- Cloud Functions for password reset emails (hosted on Firebase)

## Features
- User login/signup with Firebase Auth
- Booking calendar with date selection
- Visual cost estimation for bookings
- Photo gallery with keyboard navigation
- Address/directions integration with Apple Maps, Google Maps, and Waze
- Toast notifications for user feedback
- Responsive design for mobile devices

## Recent Changes
- Modernized UI with Inter font and cleaner styling
- Added smooth animations and transitions
- Replaced alert dialogs with toast notifications
- Improved error messages to be user-friendly
- Added keyboard navigation to photo gallery
- Cleaned up unused files
- Calendar now fits viewport without scrolling (flexbox layout)
- Navigation controls (prev/next/today) moved to footer below calendar
- Photos and Address buttons styled with gradient for prominence
