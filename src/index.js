const express = require('express');
const asyncHandler = require('express-async-handler');
const bodyParser = require('body-parser');

const database = require('./database');
const upload = require('./upload');

const app = express();
app.set('view engine', 'ejs');
// Configure routing to be more strict than it is by default.
// This fixes some common footguns
app.set('case sensitive routing', true);
app.set('strict routing', true);

// Serve simple static files
app.use(express.static('static'));

// Serve simple static uploads
app.use('/uploads/', express.static('uploads'));

// Implement session cookies
app.use(require('./session'));

// Implement file uploading
app.use(upload.any());

// Implement form parsing, needed for CSRF protection
app.use(bodyParser.urlencoded({ extended: false }));

// Implement CSRF protection
app.use(require('./csrf'));

// Implement user authentication
app.use(require('./authentication'));

// See all the items
app.get('/', asyncHandler(async (req, res) => {
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
app.get('/items/:id', asyncHandler(async (req, res) => {
  const id = req.params.id;
  const item = await database.getItem(id);
  res.render('item', {
    item: item
  });
}));

// Delete an item
app.post('/items/:id/delete', asyncHandler(async (req, res) => {
  const id = req.params.id;
  await database.deleteItem(id);
  res.redirect('/');
}));

// Create a new item
app.get('/new', (req, res) => {
  res.render('new');
});

app.post('/new', asyncHandler(async (req, res) => {
  const item = await database.newItem();

  item.name = req.body.name;
  item.amount = +req.body.amount;
  item.images = [req.files[0].filename];

  res.redirect(`/items/${item.id}`);
}));

const server = app.listen(8080, function() {
  console.log(`Listening on http://localhost:${server.address().port}`);
});
