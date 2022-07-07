const express = require('express');
const {
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour,
  aliasTopFiveTours,
  getTourStats,
} = require('../controllers/tourController');

const router = express.Router();

router.route('/tour-stats').get(getTourStats);
router.route('/top-5-cheap').get(aliasTopFiveTours, getAllTours);
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
