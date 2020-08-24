const express = require('express');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const router = express.Router();

router.use(cookieParser());
router.use(bodyParser({ extended: false }));
router.use(csurf({
  cookie: {
    httpOnly: true,
    sameSite: true
  }
}));
router.use((req, res, next) => {
  const render = res.render;
  res.render = function(name, locals, callback) {
    locals = locals || {};
    locals.csrfToken = req.csrfToken();
    render.call(this, name, locals, callback);
  };
  next();
});

module.exports = router;
