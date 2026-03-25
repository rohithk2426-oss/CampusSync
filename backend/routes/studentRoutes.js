const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const student = require('../controllers/studentController');
const upload = require('../middleware/upload');

router.use(protect);
router.use(authorize('student'));

router.get('/dashboard', student.getDashboard);
router.get('/subjects', student.getSubjects);

// Assignments
router.get('/assignments', student.getAssignments);
router.post('/submissions', (req, res, next) => { req.uploadType = 'submissions'; next(); }, upload.single('file'), student.submitAssignment);

// Notes
router.get('/notes', student.getNotes);

// Feedback
router.get('/feedback', student.getMyFeedback);
router.post('/feedback', student.submitFeedback);

// Lab Bookings (CR only)
router.post('/lab-booking', student.createLabBooking);
router.get('/lab-bookings', student.getLabBookings);

module.exports = router;
