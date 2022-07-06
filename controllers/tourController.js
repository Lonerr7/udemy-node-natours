const fs = require('fs');
const Tour = require('../models/tourModel');

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
      query = query.sort('-createdAt');
    }

    // 3) Limiting fields
    if (fields) {
      const limitByFileds = fields.split(',').join(' ');
      query = query.select(limitByFileds);
    } else {
      query = query.select('-__v')
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
