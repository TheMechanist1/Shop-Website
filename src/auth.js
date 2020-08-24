const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const {OAuth2Client} = require('google-auth-library');
const asyncHandler = require('express-async-handler');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || null;
const SECRET = process.env.SECRET || 'top sneaky';
const DOMAIN = process.env.DOMAIN || null;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const router = express.Router();

/**
 * Verifies a Google ID token.
 * @param {string} token The ID token to verify
 * @throws Will throw if the token is not valid.
 * @returns Information about the user.
 */
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload.email_verified) {
    throw new Error('Email is not verified.');
  }

  // If domain checking is enabled, check the domain.
  if (DOMAIN) {
    const domain = payload.hd;
    if (domain !== DOMAIN) {
      throw new Error('Domain does not match expected value');
    }
  }

  const userid = payload.sub;
  const email = payload.email;
  const name = payload.name;
  const picture = payload.picture;

  return {
    userid,
    email,
    name,
    picture,
  };
}

router.use(session({
  secret: SECRET,
  saveUninitialized: false,
  resave: false, // todo: change this when we choose a store
}));

router.use((req, res, next) => {
  const render = res.render;
  res.render = function(name, locals, callback) {
    locals = locals || {};
    locals.session = req.session;
    render.call(this, name, locals, callback);
  };
  next();
});

router.post('/login/google', bodyParser.urlencoded({ extended: false }), asyncHandler(async (req, res) => {
  try {
    const account = await verify(req.body.token);
    req.session.isSignedIn = true;
    req.session.user = account;
    res.send('ok');
  } catch (e) {
    res.status(400).send('not ok');
  }
}));

router.get('/login', (req, res) => {
  if (req.session.isSignedIn) {
    res.redirect('/');
    return;
  }

  res.render('login', {
    GOOGLE_CLIENT_ID
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(function(err) {
    if (err) {
      console.error(err);
      res.status(500).send('Could not log you out.');
      return;
    }

    res.redirect('/login?loggedout');
  });
});

router.use((req, res, next) => {
  if (req.session.isSignedIn) {
    next();
  } else {
    res.redirect('/login');
  }
});

// If no client ID is set, auth is disabled.
if (GOOGLE_CLIENT_ID === null) {
  module.exports = (req, res, next) => next();
} else {
  module.exports = router;
}
