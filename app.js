// app.js

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();

// Import User model
const User = require('./models/user'); // Make sure this is the correct path


// Set up body parser for POST requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Set up session management
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true for HTTPS, false for HTTP
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: '#453762674754-f221ng2p2flukdrl5gtbduj7jb631426.apps.googleusercontent.com',
  clientSecret: '#SSGOCSPX-cqTn-hArJJkvaQIlrZpnt0b3k0NI',
  callbackURL: 'http://localhost:3000/auth/google/callback'
},
(token, tokenSecret, profile, done) => {
  // Find user by googleId
  User.findOne({ googleId: profile.id })
    .then(existingUser => {
      if (existingUser) {
        // User exists, log them in
        return done(null, existingUser);
      }

      // If the user doesn't exist, create a new one
      new User({
        googleId: profile.id,
        displayName: profile.displayName || 'likhitha',
        email: profile.emails[0].value,
        profilePic: profile.photos[0].value
      }).save()
        .then(user => done(null, user))  // On success, return the user
        .catch(err => done(err));  // Catch any errors
    })
    .catch(err => done(err));  // Handle any errors during the database query
}));

// Serialize the user into the session
passport.serializeUser((user, done) => {
  done(null, user.id);  // Store the user's MongoDB _id in the session
});

// Deserialize the user from the session
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => done(null, user))  // Return the user if found
    .catch(err => done(err));  // Handle errors
});

// Set up routes

// Start the Google OAuth flow
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Google OAuth callback route
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/dashboard');
  }
);

// Dashboard route (Protected route)
app.get('/dashboard', (req, res) => {
  if (!req.user) {
    return res.redirect('/');
  }

  res.send(`
    <h1>Welcome to the Dashboard</h1>
    <h2>User: ${req.user.displayName}</h2>
    <h3>Email: ${req.user.email}</h3>
    <img src="${req.user.profilePic}" alt="Profile Picture" />
  `);
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// Root route
app.get('/', (req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }

  res.send('<h1>Welcome! <a href="/auth/google">Login with Google</a></h1>');
});

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/googleAuthDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB (googleAuthDB)'))
  .catch(err => console.log(err));

// Start the server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
