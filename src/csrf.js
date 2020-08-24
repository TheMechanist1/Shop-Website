const express = require('express');
const csurf = require('csurf');
const bodyParser = require('body-parser');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(csurf());
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
