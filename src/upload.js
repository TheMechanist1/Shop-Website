const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid');

const UPLOAD_DIR = 'uploads/';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: (req, res, callback) => {
    callback(null, UPLOAD_DIR);
  },
  filename: (req, file, callback) => {
    const parsedFilename = path.parse(file.originalname);
    const filenameSafe = parsedFilename.name
      // Spaces become underscore
      .replace(/\s/g, '_')
      // Anything that is not alphanumeric, a hyphen, or underscore is removed
      .replace(/[^-_a-zA-Z0-9]/g, '')
      // Up to 20 characters
      .substring(0, 20);
    const extension = parsedFilename.ext;
    callback(null, `${filenameSafe}.${uuid()}${extension}`);
  }
});

const upload = multer({
  storage
});

module.exports = upload;
