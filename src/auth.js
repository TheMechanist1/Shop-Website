const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const {OAuth2Client} = require('google-auth-library');
const asyncHandler = require('express-async-handler');

const GOOGLE_CLIENT_ID = '156261425647-fqf94ed5k1fu40sjl4q20m1u8dauhg6o.apps.googleusercontent.com';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const router = express.Router();

async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  const domain = payload['hd'];
  // todo: verify
}

router.use(session({
  secret: 'keyboard cat',
  saveUninitialized: false,
  resave: false, // todo: change this when we choose a store
  cookie: {
    maxAge: 60000
  }
}));

router.post('/login/google', bodyParser.urlencoded({ extended: false }), asyncHandler(async (req, res) => {
  try {
    await verify(req.body.token);
    req.session.isSignedIn = true;
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

module.exports = router;
