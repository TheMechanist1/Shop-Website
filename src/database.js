const { v4: uuid } = require('uuid');
const Item = require('./item');

const items = {};

async function getAllItems() {
  return Object.keys(items);
}

async function deleteItem(id) {
  delete items[id];
}

async function getItem(id) {
  return items[id];
}

async function setItem(id, item) {
  items[id] = item;
}

async function newItem() {
  const item = new Item(uuid());
  items[item.id] = item;
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
  const item = await newItem();
  item.name = 'Test Item 1';
  item.amount = 3;
  item.images = ['3b987a286b05be2e5288624762c02f38'];
})();
