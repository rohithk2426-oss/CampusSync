const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const faculty = require('../controllers/facultyController');
const upload = require('../middleware/upload');

router.use(protect);
router.use(authorize('faculty'));

router.get('/dashboard', faculty.getDashboard);
router.get('/subjects', faculty.getSubjects);

// Assignments
router.get('/assignments', faculty.getAssignments);
router.post('/assignments', (req, res, next) => { req.uploadType = 'assignments'; next(); }, upload.array('attachments', 5), faculty.createAssignment);
router.put('/assignments/:id', faculty.updateAssignment);
router.delete('/assignments/:id', faculty.deleteAssignment);

// Submissions
router.get('/submissions/:assignmentId', faculty.getSubmissions);
router.put('/submissions/:id/grade', faculty.gradeSubmission);

// Notes
router.get('/notes', faculty.getNotes);
router.post('/notes', (req, res, next) => { req.uploadType = 'notes'; next(); }, upload.single('file'), faculty.uploadNote);
router.delete('/notes/:id', faculty.deleteNote);

module.exports = router;
