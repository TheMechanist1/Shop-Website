const { v4: uuid } = require('uuid');
const fs = require('fs');
const path = require('path');
const Item = require('./item');

const DATA_DIR = 'data/';
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

function pathOf(id) {
  // TODO: make sure this is safe
  return path.join(DATA_DIR, id);
}

async function getAllItems() {
  return fs.readdirSync(DATA_DIR);
}

async function deleteItem(id) {
  fs.unlinkSync(pathOf(id));
}

async function getItem(id) {
  const content = fs.readFileSync(pathOf(id), {
    encoding: 'utf-8'
  });
  const data = JSON.parse(content);
  const item = new Item(id, data);
  return item;
}

async function setItem(id, item) {
  const data = JSON.stringify(item);
  fs.writeFileSync(pathOf(id), data);
}

async function newItem() {
  const id = uuid();
  const item = new Item(id);
  await setItem(id, item);
  return item;
}

module.exports = {
  getAllItems,
  getItem,
  deleteItem,
  setItem,
  newItem,
};

(async () => {
  let item = await newItem();
  item.name = 'Test Item 1';
  item.amount = 3;
  item.images = ['3b987a286b05be2e5288624762c02f38'];
  await setItem(item.id, item);

  item = await newItem();
  item.name = 'Test Item 2';
  item.amount = 3;
  item.images = ['3b987a286b05be2e5288624762c02f38'];
  await setItem(item.id, item);

  item = await newItem();
  item.name = 'Test Item 3';
  item.amount = 3;
  item.images = ['3b987a286b05be2e5288624762c02f38'];
  await setItem(item.id, item);

  item = await newItem();
  item.name = 'Test Item 4';
  item.amount = 3;
  item.images = ['3b987a286b05be2e5288624762c02f38'];
  await setItem(item.id, item);

  item = await newItem();
  item.name = 'Test Item 5';
  item.amount = 3;
  item.images = ['3b987a286b05be2e5288624762c02f38'];
  await setItem(item.id, item);
})();
