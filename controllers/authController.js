const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// Sign up + immediate log in funciton
exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

// Log in function
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if the user exists and at the same time if the password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything is ok, send JWT to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

// Function, which protects routes from accessing unauthorized users
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the JWT and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Log in to get access!', 401)
    );
  }

  // 2) Validate JWT (Verification)
  const decodedJWT = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user exists
  const currentUser = await User.findById(decodedJWT.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist!',
        401
      )
    );
  }

  // 4) Check if user changed password after the JWT was issued
  if (currentUser.changedPasswordsAfter(decodedJWT.iat)) {
    return new AppError(
      'User recently changed password! Please log in again!',
      401
    );
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});
