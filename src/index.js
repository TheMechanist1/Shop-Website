const express = require('express');
const multer = require('multer');
const path = require('path');

const storage = require('./storage');

const upload = multer({ dest: 'uploads' });

const app = express();
app.set('case sensitive routing', true);
app.set('strict routing', true);
app.set('view engine', 'ejs');

app.use('/uploads/', express.static('uploads'));

app.get('/', (req, res) => {
  res.render('list', {
    items: storage,
  });
});

app.get('/items/:id(\\d+)', (req, res) => {
  const id = req.params.id;
  const item = storage[id];
  res.render('item', {
    item: item
  });
});

app.post('/items/:id/delete', (req, res) => {
  res.redirect('/');
});

app.get('/items/new', (req, res) => {
  res.render('new');
});

const newItemUpload = upload.fields([
  { name: 'name', },
  { name: 'amount' },
  { name: 'image', maxCount: 1 },
]);
app.post('/items/new', newItemUpload, (req, res) => {
  const id = storage.length++;
  storage[id] = {
    id,
    name: req.body.name,
    amount: req.body.amount
  };
  console.log(req.body);
  console.log(req.files);
  res.redirect('/items/' + id);
});

const server = app.listen(8080, function() {
  console.log(`Listening on http://localhost:${server.address().port}`);
});
