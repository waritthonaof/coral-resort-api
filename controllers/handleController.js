const AppError = require('../utils/appError');

exports.getAll = (Model, modleName) => {
  return async (req, res, next) => {
    try {
      // Query from params
      // SET Query
      const queryObj = { ...req.query };

      const excludeFields = ['page', 'sort', 'limit', 'fields', 'search'];
      excludeFields.forEach((el) => delete queryObj[el]);

      // 1. Filtering with >,>=,<,<=
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );
      queryStr = JSON.parse(queryStr);

      let query = Model.find(queryStr);

      // 2. Sorting
      if (req.query.sort) {
        let sortBy;
        if (typeof req.query.sort === 'string') {
          sortBy = req.query.sort.split(',').join(' ');
        } else {
          sortBy = req.query.sort.join(' ');
        }
        query = query.sort(sortBy);
      } else {
        query = query.sort('-createdAt');
      }

      // 3. fields
      if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
      } else {
        query = query.select('-__v');
      }

      const countData = await Model.countDocuments(query);

      // 4. Pagination
      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 10;
      const skip = (page - 1) * limit;

      query = query.skip(skip).limit(limit);

      if (req.query.page) {
        if (skip >= countData) throw new Error('This page does not exist');
      }

      const data = await query;

      res.status(200).json({
        status: 'success',
        results: countData,
        page,
        limit,
        data,
      });
    } catch (err) {
      return next(new AppError(err.message, 500, err));
    }
  };
};

exports.getOne = (Model, modelName, popOptions) => {
  return async (req, res, next) => {
    try {
      let query = Model.findById(req.params.id);

      if (popOptions) query = query.populate(popOptions);

      const doc = await query;

      res.status(200).json({
        status: 'success',
        data: doc,
      });
    } catch (err) {
      return next(
        new AppError(`${modelName} at ID ${req.params.id} not found!`, 500, err)
      );
    }
  };
};

exports.createOne = (Model, modelName) => {
  return async (req, res, next) => {
    if (req.file && modelName === 'Lodging') {
      req.body.imageCover = `${req.protocol}://${req.get(
        'host'
      )}/image/lodgings/${req.file.filename}`;
      console.log(req.body.imageCover);
    }

    try {
      const newDoc = await Model.create(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          data: newDoc,
        },
      });
    } catch (err) {
      return next(new AppError(err.message, 500, err));
    }
  };
};

exports.updateOne = (Model, modelName) => {
  return async (req, res, next) => {
    if (req.file && modelName === 'Lodging') {
      req.body.imageCover = `${req.protocol}://${req.get(
        'host'
      )}/image/lodgings/${req.file.filename}`;
      console.log(req.body.imageCover);
    }

    if (req.body.price < req.body.discount) {
      return next(
        new AppError(
          `Discount price (${req.body.discount} should be below price (${req.body.price})`,
          404
        )
      );
    }

    try {
      const doc = await Model.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        {
          new: true,
        }
      );

      if (!doc) {
        return next(
          new AppError(`${modelName} at ID ${req.params.id} not found.`, 404)
        );
      }

      res.status(200).json({
        status: 'success',
        data: doc,
      });
    } catch (err) {
      return next(new AppError(err.message, 500, err));
    }
  };
};

exports.deleteOne = (Model, modelName) => {
  return async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);

      if (!doc) {
        return next(
          new AppError(`${modelName} at ID ${req.params.id} not found.`, 404)
        );
      }

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      return next(new AppError(err.message, 500, err));
    }
  };
};
