const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');

const storage = multer.diskStorage({
  destination: function(req, res, callback) {
    callback(null, 'uploads/');
  },
  filename: function (req, file, callback) {
    callback(null, uuid() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage
});

module.exports = upload;
