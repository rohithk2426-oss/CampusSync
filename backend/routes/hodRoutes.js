const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const hod = require('../controllers/hodController');

router.use(protect);
router.use(authorize('hod'));

router.get('/dashboard', hod.getDashboard);

// Students
router.get('/students', hod.getStudents);
router.post('/students', hod.createStudent);
router.put('/students/:id', hod.updateStudent);
router.delete('/students/:id', hod.deleteStudent);

// Faculty
router.get('/faculty', hod.getFaculty);
router.post('/faculty', hod.createFaculty);
router.put('/faculty/:id', hod.updateFaculty);
router.delete('/faculty/:id', hod.deleteFaculty);

// Lab Incharges
router.get('/labincharges', hod.getLabIncharges);
router.post('/labincharges', hod.createLabIncharge);

// Subjects
router.get('/subjects', hod.getSubjects);
router.post('/assign-subject', hod.assignSubject);

// Feedback (HOD only)
router.get('/feedback', hod.getFeedback);
router.get('/feedback/analytics', hod.getFeedbackAnalytics);

// Classes
router.get('/classes', hod.getClasses);

// Activity
router.get('/activity', hod.getActivity);

module.exports = router;
