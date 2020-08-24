const express = require('express');
const multer = require('multer');
const asyncHandler = require('express-async-handler');

const storage = require('./storage');

const upload = multer({ dest: 'uploads' });

const app = express();
app.set('case sensitive routing', true);
app.set('strict routing', true);
app.set('view engine', 'ejs');

app.use(require('./auth'));

app.use('/uploads/', express.static('uploads'));

app.get('/', asyncHandler(async (req, res) => {
  const allItemIds = await storage.getAllItems();

  const items = [];
  for (const id of allItemIds) {
    items.push(await storage.getItem(id));
  }

  res.render('list', {
    items: items,
  });
}));

app.get('/items/:id', asyncHandler(async (req, res) => {
  const id = req.params.id;
  const item = await storage.getItem(id);
  res.render('item', {
    item: item
  });
}));

app.post('/items/:id/delete', asyncHandler(async (req, res) => {
  const id = req.params.id;
  await storage.deleteItem(id);
  res.redirect('/');
}));

app.get('/new', (req, res) => {
  res.render('new');
});

const newItemUpload = upload.fields([
  { name: 'name', },
  { name: 'amount' },
  { name: 'image', maxCount: 1 },
]);
app.post('/new', newItemUpload, asyncHandler(async (req, res) => {
  const item = await storage.newItem();

  item.name = req.body.name;
  item.amount = +req.body.amount;
  item.images = [req.files.image[0].filename];

  res.redirect(`/items/${item.id}`);
}));

const server = app.listen(8080, function() {
  console.log(`Listening on http://localhost:${server.address().port}`);
});
