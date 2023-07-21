const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const AppError = require('../utils/appError');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  const isValid = !!MIME_TYPE_MAP[file.mimetype];
  let error = isValid
    ? null
    : new AppError('Not an image! Please upload only image', 400);
  cb(error, isValid);
};

exports.fileUpload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.destination = (des) => {
  return (req, res, next) => {
    req.des = des;

    next();
  };
};

exports.resizeUserImage = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `${uuidv4()}${Date.now()}.jpeg`;

  try {
    const metadata = await sharp(req.file.buffer).metadata();
  } catch (error) {
    console.log(`An error occurred during processing: ${error}`);
  }

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/image/${req.des}/${req.file.filename}`, (err) => {
      if (err) {
        console.error('Error resizing image:', err);
        next(new AppError('Error resizing image', 500));
      }
    });

  next();
};
