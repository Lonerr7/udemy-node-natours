const express = require('express');
const { protect, resitrctTo } = require('../controllers/authController');
const {
  createTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour,
  aliasTopFiveTours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');

const router = express.Router();

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/top-5-cheap').get(aliasTopFiveTours, getAllTours);
router.route('/').get(protect, getAllTours).post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, resitrctTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
