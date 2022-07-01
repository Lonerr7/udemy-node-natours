const fs = require('fs');
const express = require('express');

const app = express();

app.use(express.json());

const toursDB = `${__dirname}/dev-data/data/tours-simple.json`;
const tours = JSON.parse(fs.readFileSync(toursDB));

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

app.get('/api/v1/tours/:id', (req, res) => {
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
    tour,
  });
});

app.post('/api/v1/tours', (req, res) => {
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
});

app.patch('/api/v1/tours/:id', (req, res) => {
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
});

app.delete('/api/v1/tours/:id', (req, res) => {
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
});

const port = 8000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
