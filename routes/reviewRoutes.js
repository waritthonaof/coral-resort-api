const express = require('express');

const {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { getLodgingUserIds } = require('../middleware/reviewMiddleware');
const { protect, rolePermission } = require('../middleware/authGuard');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(rolePermission('user'), getLodgingUserIds, createReview);

router.route('/:id').get(getReview).patch(updateReview).delete(deleteReview);

module.exports = router;
