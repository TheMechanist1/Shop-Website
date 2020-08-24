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
  cookie: {
    maxAge: 60000
  }
}));

router.post('/login/google', bodyParser.urlencoded({ extended: false }), asyncHandler(async (req, res) => {
  try {
    await verify(req.body.token);
    req.session.valid = true;
    res.send('ok');
  } catch (e) {
    res.status(400).send('not ok');
  }
}));

router.get('/login', (req, res) => {
  res.render('login');
});

router.use((req, res, next) => {
  if (req.session.valid) {
    next();
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
