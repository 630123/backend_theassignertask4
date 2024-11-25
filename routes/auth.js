const express = require('express');
const router = express.Router();
const passport = require('passport');

// Google login route
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
}));

// Google callback route
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/',
}), (req, res) => {
    res.redirect('/');
});

module.exports = router; // Ensure you export the router
