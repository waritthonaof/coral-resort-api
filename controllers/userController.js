const User = require('./../models/userModel');

const AppError = require('../utils/appError');
const {
  getOne,
  updateOne,
  deleteOne,
} = require('../controllers/handleController');

const filterObj = (obj, ...fileds) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (fileds.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = async (req, res, next) => {
  try {
    if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError('This route is not for password update', 400));
    }

    const filteredBody = filterObj(req.body, 'name', 'email');

    if (req.file)
      filteredBody.image = `${req.protocol}://${req.get('host')}/image/users/${
        req.file.filename
      }`;

    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: updateUser,
    });
  } catch (err) {
    return next(new AppError(err.message, 500, err));
  }
};

exports.getAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: 10,
    data: {
      bangalows: [],
    },
  });
};

exports.getUser = getOne(User, 'user');

exports.createUser = (req, res) => {
  res.status(200).send('Hello');
};

exports.updateUser = (req, res) => {
  const param = +req.param.id;
  res.status(200).send('Hello');
};

exports.deleteUser = (req, res) => {
  const param = +req.param.id;
  res.status(200).send('Hello');
};
