class Item {
  constructor(id, data = {}) {
    this.id = id;
    this.name = data.name ?? '';
    this.amount = data.amount ?? 0;
    this.partNumber = data.partNumber ?? '';
    this.images = data.images ?? [];
  }
}

module.exports = Item;
