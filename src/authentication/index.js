const express = require('express');

const AUTH_METHOD = process.env.AUTH_METHOD || null;

const router = express.Router();

if (AUTH_METHOD === 'google') {
  router.use('/login/google', require('./google'));
}

if (AUTH_METHOD === null) {
  // If authentication is disabled, attempting to use authentication will send you back to the homepage.
  router.get('/logout', (req, res) => res.redirect('/'));
  router.get('/login', (req, res) => res.redirect('/'));
} else {
  // Implement login page
  router.get('/login', (req, res) => {
    if (AUTH_METHOD === null) {
      res.redirect('/');
    } else {
      res.redirect(`/login/${AUTH_METHOD}`);
    }
  });

  // Require authentication for all following routes.
  router.use((req, res, next) => {
    if (req.session.isSignedIn) {
      next();
    } else {
      res.redirect('/login');
    }
  });

  // Implement logout page
  router.post('/logout', (req, res) => {
    req.session.destroy(function(err) {
      if (err) {
        console.error(err);
        res.status(500).send('Could not log you out.');
        return;
      }
      res.redirect('/login');
    });
  });
}

module.exports = router;
