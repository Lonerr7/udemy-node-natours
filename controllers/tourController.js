const fs = require('fs');
const Tour = require('../models/tourModel');

exports.getAllTours = (_, res) => {
  res.status(200).json({
    status: 'success',
    // results: tours.length,
    // data: {
    //   tours,
    // },
  });
};

exports.getTour = (req, res) => {};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid data sent!',
    });
  }
};

exports.updateTour = (_, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      updatedTour: '<Updated tour here...>',
    },
  });
};

exports.deleteTour = (_, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
