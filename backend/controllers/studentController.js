const Student = require('../models/Student');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Note = require('../models/Note');
const Subject = require('../models/Subject');
const Feedback = require('../models/Feedback');
const LabBooking = require('../models/LabBooking');
const Notification = require('../models/Notification');
const path = require('path');

// @desc    Get student dashboard
// @route   GET /api/student/dashboard
exports.getDashboard = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id })
            .populate('classId', 'name year')
            .populate('subjects', 'name code category');

        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const upcomingAssignments = await Assignment.find({
            subject: { $in: student.subjects },
            deadline: { $gte: new Date() }
        })
            .populate('subject', 'name code')
            .sort('deadline')
            .limit(5);

        const mySubmissions = await Submission.countDocuments({ student: student._id });
        const recentNotes = await Note.find({ subject: { $in: student.subjects } })
            .populate('subject', 'name code')
            .sort('-createdAt')
            .limit(5);

        res.json({
            student,
            upcomingAssignments,
            mySubmissions,
            recentNotes,
            isCR: student.isCR
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assignments for student
// @route   GET /api/student/assignments
exports.getAssignments = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const { subjectId, search } = req.query;
        let filter = { subject: { $in: student.subjects } };
        if (subjectId) filter.subject = subjectId;

        let assignments = await Assignment.find(filter)
            .populate('subject', 'name code')
            .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } })
            .sort('-createdAt');

        if (search) {
            assignments = assignments.filter(a =>
                a.title.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Check submission status for each
        const assignmentIds = assignments.map(a => a._id);
        const submissions = await Submission.find({
            student: student._id,
            assignment: { $in: assignmentIds }
        });

        const submissionMap = {};
        submissions.forEach(s => { submissionMap[s.assignment.toString()] = s; });

        const result = assignments.map(a => ({
            ...a.toObject(),
            submission: submissionMap[a._id.toString()] || null
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit assignment
// @route   POST /api/student/submissions
exports.submitAssignment = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const { assignmentId } = req.body;
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        let file = {};
        if (req.file) {
            file = {
                filename: req.file.originalname,
                path: path.relative(path.join(__dirname, '..'), req.file.path).replace(/\\/g, '/'),
                mimetype: req.file.mimetype
            };
        }

        const isLate = new Date() > new Date(assignment.deadline);

        const submission = await Submission.create({
            assignment: assignmentId,
            student: student._id,
            file,
            isLate
        });

        res.status(201).json(submission);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already submitted this assignment' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get notes for student
// @route   GET /api/student/notes
exports.getNotes = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const { subjectId } = req.query;
        let filter = { subject: { $in: student.subjects } };
        if (subjectId) filter.subject = subjectId;

        const notes = await Note.find(filter)
            .populate('subject', 'name code')
            .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } })
            .sort('-createdAt');
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit feedback
// @route   POST /api/student/feedback
exports.submitFeedback = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const { subjectId, facultyId, rating, teachingQuality, clarity, engagement, comment } = req.body;

        const feedback = await Feedback.create({
            student: student._id,
            faculty: facultyId,
            subject: subjectId,
            rating,
            teachingQuality,
            clarity,
            engagement,
            comment
        });

        res.status(201).json(feedback);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already given feedback for this subject' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student's feedback
// @route   GET /api/student/feedback
exports.getMyFeedback = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const feedback = await Feedback.find({ student: student._id })
            .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } })
            .populate('subject', 'name code');
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create lab booking (CR only)
// @route   POST /api/student/lab-booking
exports.createLabBooking = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });
        if (!student.isCR) return res.status(403).json({ message: 'Only CRs can book labs' });

        const { subjectId, date, periods } = req.body;

        // Validate subject is lab type
        const subject = await Subject.findById(subjectId);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });
        if (subject.category === 'theory') {
            return res.status(400).json({ message: 'Lab booking is only for Lab or Lab Integrated subjects' });
        }

        // Check for conflicting bookings
        const existingBookings = await LabBooking.find({
            date: new Date(date),
            status: { $ne: 'rejected' },
            periods: { $in: periods }
        });

        if (existingBookings.length > 0) {
            return res.status(400).json({ message: 'Some periods are already booked for this date' });
        }

        const booking = await LabBooking.create({
            cr: student._id,
            subject: subjectId,
            date,
            periods
        });

        // Notify lab incharges
        const labIncharges = await require('../models/User').find({ role: 'labincharge' });
        const notifications = labIncharges.map(li => ({
            user: li._id,
            title: 'New Lab Booking Request',
            message: `Lab booking request for ${subject.name} on ${new Date(date).toLocaleDateString()}`,
            type: 'lab_booking'
        }));
        await Notification.insertMany(notifications);

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get lab bookings for CR
// @route   GET /api/student/lab-bookings
exports.getLabBookings = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const bookings = await LabBooking.find({ cr: student._id })
            .populate('subject', 'name code')
            .sort('-createdAt');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student's subjects
// @route   GET /api/student/subjects
exports.getSubjects = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        const subjects = await Subject.find({ _id: { $in: student.subjects } })
            .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } })
            .populate('classId', 'name year');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
