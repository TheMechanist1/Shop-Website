const express = require('express');
const asyncHandler = require('express-async-handler');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const database = require('./database');

const app = express();
app.set('view engine', 'ejs');
// Configure routing to be more strict than it is by default.
// This fixes some common footguns
app.set('case sensitive routing', true);
app.set('strict routing', true);
// Remove the x-powered-by header
app.disable('x-powered-by');

// Enable some security related headers
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
app.use(helmet.noSniff());
app.use(helmet.dnsPrefetchControl({ allow: false }));
app.use(helmet.ieNoOpen());
app.use(helmet.frameguard({ action: 'sameorigin' }));
app.use(helmet.xssFilter());

// Serve simple static files
app.use(express.static('static'));

// Serve simple static uploads
app.use('/uploads/', express.static('uploads'));

// Implement session cookies
app.use(require('./middleware/session'));

// Implement file uploading
// TODO: move after auth?
app.use(require('./upload').any());

// Implement form parsing, must happen before CSRF protection
app.use(bodyParser.urlencoded({ extended: false }));

// Implement CSRF protection
app.use(require('./middleware/csrf'));

// Implement "render properties"
app.use(require('./middleware/render-props'));

// Implement user authentication
// All routes below this point may require authentication to access
app.use(require('./authentication'));

app.get('/', (req, res) => {
  res.redirect('/inventory/');
});

// See all the items
app.get('/inventory/', asyncHandler(async (req, res) => {
  const allItemIds = await database.getAllItems();

  const items = [];
  for (const id of allItemIds) {
    items.push(await database.getItem(id));
  }

  res.render('list', {
    items: items,
  });
}));

// Get information for a specific item
app.get('/inventory/items/:id', asyncHandler(async (req, res) => {
  const id = req.params.id;
  const item = await database.getItem(id);
  res.render('item', {
    item: item
  });
}));

// Delete an item
app.post('/inventory/items/:id/delete', asyncHandler(async (req, res) => {
  const id = req.params.id;
  await database.deleteItem(id);
  res.redirect('/');
}));

// View form to create a new item
app.get('/inventory/new', (req, res) => {
  res.render('new');
});

// Create a new item
app.post('/inventory/new', asyncHandler(async (req, res) => {
  const item = await database.newItem();

  item.name = req.body.name; // todo: error if not exists
  item.amount = +req.body.amount || 0; // todo: no negatives, no decimals, no naughty numbers

  if (req.files.length) {
    item.images = [req.files[0].filename];
  }

  if (req.body['part-number']) {
    item.partNumber = req.body['part-number'];
  }

  await database.setItem(item.id, item);

  res.redirect(`/inventory/items/${item.id}`);
}));

// Edit item
app.post('/inventory/items/:id/edit', asyncHandler(async (req, res) => {
  const id = req.params.id;
  const item = await database.getItem(id);

  item.amount = +req.body.amount || 0;

  await database.setItem(item.id, item);

  res.redirect(`/inventory/items/${item.id}`);
}));

app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404');
  } else {
    res.send('404');
  }
});

app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  res.status(403)
  res.send('Request could not be processed for security reasons. Please go back and try again.');
});

const server = app.listen(8080, function() {
  console.log(`Listening on http://localhost:${server.address().port}`);
});
