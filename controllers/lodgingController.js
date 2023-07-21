const Lodging = require('../models/lodgingModel');

const {
  createOne,
  getOne,
  updateOne,
  deleteOne,
  getAll,
} = require('../controllers/handleController');

exports.getAllLodgings = getAll(Lodging, 'Lodging');
exports.getLodging = getOne(Lodging, 'Lodging', { path: 'reviews' });
exports.createLodging = createOne(Lodging, 'Lodging');
exports.updateLodging = updateOne(Lodging, 'Lodging');
exports.deleteLodging = deleteOne(Lodging, 'Lodging');
