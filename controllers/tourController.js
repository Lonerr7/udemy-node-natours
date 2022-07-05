const fs = require('fs');
const Tour = require('../models/tourModel');

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'error',
      message: 'Bad Request',
    });
  }
  next();
};

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

exports.createTour = (req, res) => {};

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
