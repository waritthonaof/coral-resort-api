const { ISODate } = require('mongoose');

const Booking = require('../models/bookingModel');
const Lodging = require('../models/lodgingModel');
const AppError = require('../utils/appError');
const { add, getToday } = require('date-fns');

const { protect, rolePermission } = require('../middleware/authGuard');

const {
  createOne,
  getOne,
  updateOne,
  deleteOne,
  getAll,
} = require('../controllers/handleController');

exports.getAllBookings = getAll(Booking, 'booking');
exports.getBooking = getOne(Booking, 'booking');
exports.updateBooking = updateOne(Booking, 'booking');
exports.createBooking = async (req, res, next) => {
  if (!req.body.lodging && !req.body.user) {
    return next(new AppError(`Booking require lodingId and userId`, 400));
  }

  try {
    const lodging = await Lodging.findById(req.body.lodging);
    if (!lodging) {
      return next(new AppError(`loding not found try again!`, 404));
    }

    const bookingData = {
      price: lodging.price,
      discount: lodging.discount,
      totalPrice: lodging.price - lodging.discount,
      ...req.body,
    };

    const booking = await Booking.create(bookingData);

    res.status(201).json({
      status: 'success',
      data: {
        data: booking,
      },
    });
  } catch (err) {
    return next(new AppError(err.message, 500, err));
  }
};

exports.getTotalPrice = async (req, res, next) => {
  try {
    const calSumTotalPrice = await Booking.aggregate([
      {
        $group: { _id: null, sumTotalPrice: { $sum: '$totalPrice' } },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: calSumTotalPrice[0],
    });
  } catch (err) {
    return next(new AppError(err.message, 500, err));
  }
};

exports.getPriceByMonth = async (req, res, next) => {
  try {
    const priceByMonth = await Booking.aggregate([
      { $match: { paid: true } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          sumTotalPrice: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      status: 'success',
      data: priceByMonth,
    });
  } catch (err) {
    return next(new AppError(err.message, 500, err));
  }
};

exports.getStayDuration = async (req, res, next) => {
  try {
    const stayDuration = await Booking.aggregate([
      {
        $match: { $or: [{ status: 'checked-in' }, { status: 'checked-out' }] },
      },
      {
        $project: {
          startDate: '$startDate',
          endDate: '$endDate',
          days: {
            $dateDiff: {
              startDate: '$startDate',
              endDate: '$endDate',
              unit: 'day',
            },
          },
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: stayDuration,
    });
  } catch (err) {
    return next(new AppError(err.message, 500, err));
  }
};

exports.getToday = async (req, res, next) => {
  // console.log(new Date().toISOString().setUTCHours(0, 0, 0, 0));
  try {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const todayData = await Booking.find({
      $or: [
        {
          $and: [
            { status: 'unconfirmed' },
            { startDate: { $gte: startOfDay, $lt: currentDate } },
          ],
        },
        {
          $and: [
            { status: 'checked-in' },
            { endDate: { $gte: startOfDay, $lt: currentDate } },
          ],
        },
      ],
    });

    res.status(200).json({
      status: 'success',
      data: todayData,
    });
  } catch (err) {
    return next(new AppError(err.message, 500, err));
  }
};
