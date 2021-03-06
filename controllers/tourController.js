const Tour = require('../models/tourModel');
const { APIFeatures } = require('../utils/APIFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopFiveTours = (req, _, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res) => {
  // BUILD QUERY && OPERATING ON IT
  // 1A) Filtering
  const { page, sort, limit, fields, ...queryObj } = req.query;

  // 1B) Advanced filtering
  let query = APIFeatures.filterByQuery(queryObj, Tour);

  // 2) Sorting
  query = APIFeatures.sortByQuery(sort, query);

  // 3) Limiting fields
  query = APIFeatures.chooseFieldsByQuery(fields, query);

  // 4) Pagination
  query = APIFeatures.paginate(page, limit, query, Tour);

  // EXECUTE QUERY
  const tours = await query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour)
    return next(new AppError(`No tour found with id: ${req.params.id}`, 404));

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create({
    ...req.body,
    createdAt: req.requestTime,
  });

  res.status(201).json({
    status: 'success',
    data: {
      newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTour)
    return next(new AppError(`No tour found with id: ${req.params.id}`, 404));

  res.status(200).json({
    status: 'success',
    data: {
      updatedTour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const deletedTour = await Tour.findByIdAndDelete(req.params.id);

  if (!deletedTour)
    return next(new AppError(`No tour found with id: ${req.params.id}`, 404));

  res.status(204).json({
    status: 'success',
    data: {
      deletedTour,
    },
  });
});

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const { year } = req.params;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    // {
    //   $limit: 6
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
