const express = require('express');

const AUTH_METHOD = process.env.AUTH_METHOD || null;

const router = express.Router();

router.use((req, res, next) => {
  const render = res.render;
  res.render = function(name, locals, callback) {
    locals = locals || {};
    locals.session = req.session;
    render.call(this, name, locals, callback);
  };
  next();
});

if (AUTH_METHOD === 'google') {
  router.use('/login/google', require('./google'));
}

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

router.get('/login', (req, res) => {
  if (AUTH_METHOD === null) {
    res.redirect('/');
  } else {
    res.redirect(`/login/${AUTH_METHOD}`);
  }
});

router.use((req, res, next) => {
  if (req.session.isSignedIn) {
    next();
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
