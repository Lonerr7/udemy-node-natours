const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

const hanldeDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  // Extract error messages from each error that occured during validation.]
  const errorMsgs = Object.values(err.errors)
    .map((errMsg) => errMsg.message)
    .join('. ');

  const message = `Invalid input data: ${errorMsgs}`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('The token is expired! Please log in again!', 401);

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendProdError = (err, res) => {
  // Operational, trusted error. In this case we send a message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error. In this case we don't send a detailed error message.
  } else {
    // 1) Log error
    console.error('Error', err);

    // 2) Send a generic message to the client
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

// Global error handler (is called whenever an error is thrown by a developer or by mongoose)
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let errCopy = Object.assign(err);

    // Handling errors with invalid _id
    if (errCopy.name === 'CastError') errCopy = handleCastErrorDB(errCopy);
    // Handling errors with duplicate name when creating a new tour
    if (errCopy.code === 11000) errCopy = hanldeDuplicateFieldsDB(errCopy);
    // Handling validation errors
    if (errCopy.name === 'ValidationError')
      errCopy = handleValidationErrorDB(errCopy);
    if (errCopy.name === 'JsonWebTokenError') errCopy = handleJWTError();
    if (errCopy.name === 'TokenExpiredError') errCopy = handleJWTExpiredError();

    // Sending an error response to the client
    sendProdError(errCopy, res);
  }
};
