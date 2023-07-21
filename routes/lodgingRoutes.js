const express = require('express');

const {
  getAllLodgings,
  createLodging,
  getLodging,
  updateLodging,
  deleteLodging,
} = require('../controllers/lodgingController');
const reviewRouter = require('./reviewRoutes');
const { protect, rolePermission } = require('../middleware/authGuard');
const {
  resizeUserImage,
  fileUpload,
  destination,
} = require('../middleware/fileUpload');

const router = express.Router();

router.use('/:lodgingId/reviews', reviewRouter);

router
  .route('/')
  .get(getAllLodgings)
  .post(
    fileUpload.single('imageCover'),
    destination('lodgings'),
    resizeUserImage,
    createLodging
  );

router
  .route('/:id')
  .get(getLodging)
  .patch(
    fileUpload.single('imageCover'),
    destination('lodgings'),
    resizeUserImage,
    updateLodging
  )
  .delete(deleteLodging);

module.exports = router;
