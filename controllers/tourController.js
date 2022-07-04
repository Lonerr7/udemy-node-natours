const fs = require('fs');

const toursDB = `${__dirname}/../dev-data/data/tours-simple.json`;
const tours = JSON.parse(fs.readFileSync(toursDB));

exports.checkId = (_, res, next, val) => {
  const id = +val;

  if (id > tours.length) {
    return res.status(404).json({
      status: 'error',
      message: 'Invalid ID',
    });
  }
  next();
};

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
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const { id: strId } = req.params;
  const id = +strId;
  const tour = tours.find((t) => t.id === id);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    tour,
  });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = {
    id: newId,
    ...req.body,
  };
  tours.push(newTour);
  fs.writeFile(toursDB, JSON.stringify(tours), () => {
    res.status(201).json({
      status: 'success',
      addedTour: newTour,
    });
  });
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
