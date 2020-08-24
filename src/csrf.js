const express = require('express');
const csurf = require('csurf');

const router = express.Router();

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
