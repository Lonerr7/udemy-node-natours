const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globallErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// ========== Global Middlewares ==================
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from the same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many requests from this IP! Please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json());

// Data sanitazation against NoSQL query injection
app.use(mongoSanitize());

// Data sanitazation against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ========== Mounting Routers ==================
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
// Handling error when no routes matched
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// ========== Global Error Handling Middleware ==================
app.use(globallErrorHandler);

// ========== Server starting ==================
module.exports = app;
