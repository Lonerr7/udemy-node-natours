const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globallErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// ========== Middlewares ==================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});
app.use(express.static(`${__dirname}/public`));

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
