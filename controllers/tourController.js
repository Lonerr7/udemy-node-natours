const fs = require('fs');
const Tour = require('../models/tourModel');

exports.aliasTopFiveTours = (req, _, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // BUILD QUERY
    // 1A) Filtering
    const { page, sort, limit, fields, ...queryObj } = req.query;

    // 1B) Advanced filtering
    const queryStr = JSON.stringify(queryObj);
    const replacedQueryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (substr) => `$${substr}`
    );
    let query = Tour.find(JSON.parse(replacedQueryStr));

    // 2) Sorting
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt _id');
    }

    // 3) Limiting fields
    if (fields) {
      const limitByFileds = fields.split(',').join(' ');
      query = query.select(limitByFileds);
    } else {
      query = query.select('-__v');
    }

    // 4) Pagination
    const queriedPage = +page || 1;
    const queriedLimit = +limit || 3;
    const skip = (queriedPage - 1) * queriedLimit;

    query = query.skip(skip).limit(queriedLimit);

    if (page) {
      const toursCount = await Tour.countDocuments();
      if (skip >= toursCount) throw new Error('The page does not exist');
    }

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
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        updatedTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid data sent!',
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);

    if (!deletedTour) throw new Error('The tour does no longer exist!');

    res.status(204).json({
      status: 'success',
      data: {
        deletedTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};
