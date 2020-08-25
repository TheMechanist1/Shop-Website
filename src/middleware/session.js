const session = require('express-session');

const SECRET = process.env.SECRET || 'top sneaky';

module.exports = session({
  secret: SECRET,
  saveUninitialized: false,
  resave: false, // todo: change this when we choose a store
  cookie: {
    httpOnly: true,
    sameSite: true,
    secure: 'auto'
  }
});
