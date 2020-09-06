const express = require('express');
const asyncHandler = require('express-async-handler');
const {OAuth2Client} = require('google-auth-library');

const User = require('./user');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || null;
const DOMAIN = process.env.DOMAIN || null;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const router = express.Router();

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

  const user = new User(payload.name);
  // TODO: check email ends with @isd112.org
  if (payload.email) {
    user.email = payload.email;
    // FIXME
    if (payload.email === '22cooksleyd@isd112.org' || payload.email === 'tommyweber33@gmail.com') {
      user.isAdmin = true;
    }
  }
  if (payload.picture) {
    user.picture = payload.picture;
  }

  return user;
}

router.get('/', (req, res) => {
  res.render('login/google', {
    GOOGLE_CLIENT_ID
  });
});

router.post('/', asyncHandler(async (req, res) => {
  try {
    const account = await verify(req.body.token);
    req.session.isSignedIn = true;
    req.session.user = account;
    res.redirect('/');
  } catch (e) {
    res.status(400).send('Could not sign in. Press back to try again.');
  }
}));

module.exports = router;
