const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

// ========== Middlewares ==================
app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ========== Route Handlers ==================
const toursDB = `${__dirname}/dev-data/data/tours-simple.json`;
const tours = JSON.parse(fs.readFileSync(toursDB));

// Tours
const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  const { id: strId } = req.params;
  const id = +strId;

  if (id > tours.length) {
    return res.status(404).json({
      status: 'error',
      message: 'Invalid ID',
    });
  }

  const tour = tours.find((t) => t.id === id);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    tour,
  });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = {
    id: newId,
    ...req.body,
  };
  tours.push(newTour);
  fs.writeFile(toursDB, JSON.stringify(tours), (err) => {
    res.status(201).json({
      status: 'success',
      addedTour: newTour,
    });
  });
};

const updateTour = (req, res) => {
  const { id: strId } = req.params;
  const id = +strId;

  if (id > tours.length) {
    return res.status(404).json({
      status: 'error',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      updatedTour: '<Updated tour here...>',
    },
  });
};

const deleteTour = (req, res) => {
  const { id: strId } = req.params;
  const id = +strId;

  if (id > tours.length) {
    return res.status(404).json({
      status: 'error',
      message: 'Invalid ID',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

// Users
const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const createUser = (req, res) => {};

const getUser = (req, res) => {};

const updateUser = (req, res) => {};

const deleteUser = (req, res) => {};

// ========== Routes ==================
const tourRouter = express.Router();
app.use('/api/v1/tours', tourRouter);

const userRouter = express.Router();
app.use('/api/v1/users', userRouter);

// Tours
tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

// Users
userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

// ========== Server starting ==================
const port = 8000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
