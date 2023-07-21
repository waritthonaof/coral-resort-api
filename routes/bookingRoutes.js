const express = require('express');

const {
  createBooking,
  getAllBookings,
  getBooking,
  uploadBooking,
  updateBooking,
  getTotalPrice,
  getPriceByMonth,
  getStayDuration,
  getToday,
} = require('../controllers/bookingController');

const router = express.Router();

router.route('/total-price').get(getTotalPrice);
router.route('/price-per-day').get(getPriceByMonth);
router.route('/stay-duration').get(getStayDuration);
router.route('/today').get(getToday);

router.route('/').get(getAllBookings).post(createBooking);

router.route('/:id').get(getBooking).patch(updateBooking);

module.exports = router;
