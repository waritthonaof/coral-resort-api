const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const lodgingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Lodging must have a type'],
      enum: {
        values: ['Bungalow', 'Room'],
        message: 'Type is either: Bungalow or Room',
      },
    },
    name: {
      type: String,
      required: [true, 'Lodging must have a name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    facilities: [String],
    price: {
      type: Number,
      required: [true, 'Lodging must have a price'],
      min: [1, 'Price must be above 1.0'],
    },
    ratingsAverage: {
      type: Number,
      default: 0,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be above 0'],
      max: [5, 'Rating must be Below 5.0'],
    },
    maxCapacity: {
      type: Number,
      default: 1,
    },
    discount: {
      type: Number,
      default: 0,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below price ',
      },
    },
    imageCover: {
      type: String,
      required: [true, 'Lodging must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

lodgingSchema.plugin(uniqueValidator);

// Virtual populate
lodgingSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'lodging',
  localField: '_id',
});

lodgingSchema.pre(/^find/, function (next) {
  this.start = Date.now();
  this.select('-__v');
  next();
});

const Lodging = mongoose.model('Lodging', lodgingSchema);

module.exports = Lodging;
