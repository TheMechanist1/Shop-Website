// This middleware overrides res.render to always include certain values in the variables object.
module.exports = (req, res, next) => {
  const render = res.render;
  res.render = function(name, locals, callback) {
    locals = locals || {};
    locals.csrfToken = req.csrfToken();
    locals.session = req.session;
    render.call(this, name, locals, callback);
  };
  next();
};
