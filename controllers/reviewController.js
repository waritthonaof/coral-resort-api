const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const {
  createOne,
  getOne,
  updateOne,
  deleteOne,
} = require('../controllers/handleController');

exports.getAllReviews = async (req, res, next) => {
  try {
    let filter = {};
    if (req.params.lodgingId) filter = { lodging: req.params.lodgingId };

    const reviews = await Review.find(filter);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  } catch (err) {
    return next(
      new AppError(`Can not get all reviews please try again!`, 500, err)
    );
  }
};

exports.getReview = getOne(Review, 'review');
exports.createReview = createOne(Review, 'review');
exports.updateReview = updateOne(Review, 'review');
exports.deleteReview = deleteOne(Review, 'review');
