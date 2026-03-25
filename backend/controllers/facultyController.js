const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Note = require('../models/Note');
const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const path = require('path');

// @desc    Get faculty dashboard
// @route   GET /api/faculty/dashboard
exports.getDashboard = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user._id });
        if (!faculty) return res.status(404).json({ message: 'Faculty profile not found' });

        const subjects = await Subject.find({ faculty: faculty._id }).populate('classId', 'name year');
        const assignments = await Assignment.countDocuments({ faculty: faculty._id });
        const notes = await Note.countDocuments({ faculty: faculty._id });
        const submissions = await Submission.countDocuments({
            assignment: { $in: await Assignment.find({ faculty: faculty._id }).select('_id') }
        });

        res.json({
            faculty,
            subjects,
            totalAssignments: assignments,
            totalNotes: notes,
            totalSubmissions: submissions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get faculty subjects
// @route   GET /api/faculty/subjects
exports.getSubjects = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user._id });
        if (!faculty) return res.status(404).json({ message: 'Faculty profile not found' });

        const subjects = await Subject.find({ faculty: faculty._id })
            .populate('classId', 'name year');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assignments for faculty
// @route   GET /api/faculty/assignments
exports.getAssignments = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user._id });
        if (!faculty) return res.status(404).json({ message: 'Faculty profile not found' });

        const { subjectId } = req.query;
        let filter = { faculty: faculty._id };
        if (subjectId) filter.subject = subjectId;

        const assignments = await Assignment.find(filter)
            .populate('subject', 'name code')
            .sort('-createdAt');
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create assignment
// @route   POST /api/faculty/assignments
exports.createAssignment = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user._id });
        if (!faculty) return res.status(404).json({ message: 'Faculty profile not found' });

        const { title, description, subjectId, deadline, maxMarks } = req.body;

        const attachments = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                attachments.push({
                    filename: file.originalname,
                    path: path.relative(path.join(__dirname, '..'), file.path).replace(/\\/g, '/'),
                    mimetype: file.mimetype
                });
            });
        }

        const assignment = await Assignment.create({
            title,
            description,
            subject: subjectId,
            faculty: faculty._id,
            deadline,
            maxMarks: maxMarks || 10,
            attachments
        });

        // Notify students in the subject's class
        const subject = await Subject.findById(subjectId);
        const students = await Student.find({ classId: subject.classId });
        const notifications = students.map(s => ({
            user: s.user,
            title: 'New Assignment',
            message: `New assignment "${title}" posted for ${subject.name}`,
            type: 'assignment'
        }));
        await Notification.insertMany(notifications);

        const populated = await Assignment.findById(assignment._id)
            .populate('subject', 'name code');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update assignment
// @route   PUT /api/faculty/assignments/:id
exports.updateAssignment = async (req, res) => {
    try {
        const { title, description, deadline, maxMarks } = req.body;
        const assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            { title, description, deadline, maxMarks },
            { new: true }
        ).populate('subject', 'name code');

        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete assignment
// @route   DELETE /api/faculty/assignments/:id
exports.deleteAssignment = async (req, res) => {
    try {
        await Assignment.findByIdAndDelete(req.params.id);
        await Submission.deleteMany({ assignment: req.params.id });
        res.json({ message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get submissions for an assignment
// @route   GET /api/faculty/submissions/:assignmentId
exports.getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ assignment: req.params.assignmentId })
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name email' }
            })
            .sort('-submittedAt');
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Grade a submission
// @route   PUT /api/faculty/submissions/:id/grade
exports.gradeSubmission = async (req, res) => {
    try {
        const { marks, feedback } = req.body;
        const submission = await Submission.findByIdAndUpdate(
            req.params.id,
            { marks, feedback },
            { new: true }
        ).populate({
            path: 'student',
            populate: { path: 'user', select: 'name email' }
        });

        if (!submission) return res.status(404).json({ message: 'Submission not found' });
        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload notes
// @route   POST /api/faculty/notes
exports.uploadNote = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user._id });
        if (!faculty) return res.status(404).json({ message: 'Faculty profile not found' });

        const { title, subjectId, description } = req.body;

        let file = {};
        if (req.file) {
            file = {
                filename: req.file.originalname,
                path: path.relative(path.join(__dirname, '..'), req.file.path).replace(/\\/g, '/'),
                mimetype: req.file.mimetype
            };
        }

        const note = await Note.create({
            title,
            subject: subjectId,
            faculty: faculty._id,
            file,
            description
        });

        const populated = await Note.findById(note._id)
            .populate('subject', 'name code');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get notes by faculty
// @route   GET /api/faculty/notes
exports.getNotes = async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ user: req.user._id });
        if (!faculty) return res.status(404).json({ message: 'Faculty profile not found' });

        const { subjectId } = req.query;
        let filter = { faculty: faculty._id };
        if (subjectId) filter.subject = subjectId;

        const notes = await Note.find(filter)
            .populate('subject', 'name code')
            .sort('-createdAt');
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete note
// @route   DELETE /api/faculty/notes/:id
exports.deleteNote = async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: 'Note deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
