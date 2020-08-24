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

const handleLogout = (req, res) => {
  req.session.destroy(function(err) {
    if (err) {
      console.error(err);
      res.status(500).send('Could not log you out.');
      return;
    }
    res.redirect('/login');
  });
};

const handleLogin = (req, res) => {
  if (AUTH_METHOD === null) {
    res.redirect('/');
  } else {
    res.redirect(`/login/${AUTH_METHOD}`);
  }
};

const requireAuthentication = (req, res, next) => {
  if (req.session.isSignedIn) {
    next();
  } else {
    res.redirect('/login');
  }
};

if (AUTH_METHOD === 'google') {
  router.use('/login/google', require('./google'));
}

if (AUTH_METHOD === null) {
  router.get('/logout', (req, res) => res.redirect('/'));
  router.get('/login', (req, res) => res.redirect('/'));
} else {
  router.post('/logout', handleLogout);
  router.get('/login', handleLogin);
  router.use(requireAuthentication);
}

module.exports = router;
