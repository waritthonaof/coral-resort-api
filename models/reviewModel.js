const mongoose = require('mongoose');
const Lodging = require('./lodgingModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can note be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    lodging: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lodging',
      required: [true, 'Review must belong to a lodging'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, async function (next) {
  this.populate({
    path: 'user',
    select: 'name image',
  });

  next();
});

// Calculate Rating and update in lodging
reviewSchema.statics.calcAvgRatings = async function (lodgingId) {
  const stats = await this.aggregate([
    {
      $match: { lodging: lodgingId },
    },
    {
      $group: {
        _id: '$lodging',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Lodging.findByIdAndUpdate(lodgingId, {
    ratingsQuantity: stats.length > 0 ? stats[0].nRating : 0,
    ratingsAverage: stats.length > 0 ? stats[0].avgRating : 4.5,
  });
};

reviewSchema.post('save', function () {
  this.constructor.calcAvgRatings(this.lodging);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.model.find();
  next();
});

reviewSchema.post(/^findOneAnd/, async function (docs) {
  await docs.constructor.calcAvgRatings(docs.lodging);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
