const jwt = require('jsonwebtoken');
const cryto = require('crypto');
const ObjectId = require('mongodb').ObjectId;

const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const { sendEmailResetPassword } = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  user.password = undefined;

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: false,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: user,
  });
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm, role } = req.body;
    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm,
      role,
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    return next(new AppError(err.message, 500, err));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everythink ok, send token to client
    createSendToken(user, 200, res);
  } catch (err) {
    return next(new AppError(err.message, 500, err));
  }
};

exports.logout = (req, res, next) => {
  res.cookie('jwt', 'loggedout!', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

exports.forgotPassword = async (req, res, next) => {
  // 1. Get user from email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2. Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send it to user email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/vi/users/reset-password/${resetToken}`;

  try {
    await sendEmailResetPassword(user, resetURL);

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
        err
      )
    );
  }
};

exports.resetPassword = async (req, res, next) => {
  if (!req.params.token) {
    return next(new AppError('Reset password must have token', 400));
  }

  // 1. Get user based on the token
  const hashedToken = cryto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is valid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3. Update changedPasswordAt property for the user in User model

  // 4. Log the user in, send JWT
  createSendToken(user, 200, res);
};

exports.updatePassword = async (req, res, next) => {
  try {
    // 1. Get user from collection

    const user = await User.findById(req.user.id).select('+password');

    // 2. Check current password is correct
    if (
      !(await user.comparePassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError('Your current password is wrong.', 401));
    }

    if (req.user._id.equals(new ObjectId('64a93b88629bd288d073ed6a'))) {
      return createSendToken(user, 200, res);
    }

    // 3. Update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    // 4. Log the user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    return next(new AppError(err.message, 500, err));
  }
};
