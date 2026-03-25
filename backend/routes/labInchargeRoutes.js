const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const labIncharge = require('../controllers/labInchargeController');

router.use(protect);
router.use(authorize('labincharge'));

router.get('/dashboard', labIncharge.getDashboard);
router.get('/bookings', labIncharge.getBookings);
router.put('/bookings/:id/approve', labIncharge.approveBooking);
router.put('/bookings/:id/reject', labIncharge.rejectBooking);
router.get('/schedule', labIncharge.getSchedule);
router.get('/analytics/advanced', labIncharge.getBookingAnalytics);

module.exports = router;
