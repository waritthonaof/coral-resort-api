const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const bookingSchema = new mongoose.Schema({
  lodging: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lodging',
    required: [true, 'Booking must belong to a Lodging!'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a Lodging!'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price!'],
  },
  numUsers: {
    type: Number,
  },
  discount: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: [true, 'Booking must have a total price!'],
  },
  startDate: {
    type: Date,
    required: [true, 'Booking must have a date start!'],
  },
  endDate: {
    type: Date,
    required: [true, 'Booking must have a date end!'],
  },
  paid: {
    type: Boolean,
  },
  status: {
    type: String,
    required: [true, 'Lodging must have a type'],
    enum: {
      values: ['unconfirmed', 'confirmed', 'checked-in', 'checked-out'],
      message: 'Status no valid try again.',
    },
    default: 'unconfirmed',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name email' }).populate({
    path: 'lodging',
    select: 'name',
  });

  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
