const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const Feedback = require('../models/Feedback');
const LabBooking = require('../models/LabBooking');
const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');

// @desc    Get dashboard stats
// @route   GET /api/hod/dashboard
exports.getDashboard = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalFaculty = await Faculty.countDocuments();
        const totalSubjects = await Subject.countDocuments();
        const totalClasses = await Class.countDocuments();
        const pendingBookings = await LabBooking.countDocuments({ status: 'pending' });
        const totalAssignments = await Assignment.countDocuments();
        const totalFeedback = await Feedback.countDocuments();

        res.json({
            totalStudents,
            totalFaculty,
            totalSubjects,
            totalClasses,
            pendingBookings,
            totalAssignments,
            totalFeedback
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all students
// @route   GET /api/hod/students
exports.getStudents = async (req, res) => {
    try {
        const { classId, search } = req.query;
        let filter = {};
        if (classId) filter.classId = classId;

        let students = await Student.find(filter)
            .populate('user', 'name email isActive')
            .populate('classId', 'name year')
            .populate('subjects', 'name code');

        if (search) {
            students = students.filter(s =>
                s.user.name.toLowerCase().includes(search.toLowerCase()) ||
                s.rollNumber.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create student
// @route   POST /api/hod/students
exports.createStudent = async (req, res) => {
    try {
        const { name, email, password, rollNumber, classId, semester, isCR } = req.body;

        // Create user account
        const user = await User.create({
            name, email, password: password || 'password123', role: 'student'
        });

        // Get class subjects
        const subjects = await Subject.find({ classId, semester });

        const student = await Student.create({
            user: user._id,
            rollNumber,
            classId,
            semester,
            isCR: isCR || false,
            subjects: subjects.map(s => s._id)
        });

        // Add student to class
        await Class.findByIdAndUpdate(classId, { $push: { students: student._id } });

        const populated = await Student.findById(student._id)
            .populate('user', 'name email')
            .populate('classId', 'name year')
            .populate('subjects', 'name code');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student
// @route   PUT /api/hod/students/:id
exports.updateStudent = async (req, res) => {
    try {
        const { name, email, rollNumber, classId, semester, isCR } = req.body;
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        if (name || email) {
            await User.findByIdAndUpdate(student.user, { name, email });
        }

        const updated = await Student.findByIdAndUpdate(
            req.params.id,
            { rollNumber, classId, semester, isCR },
            { new: true }
        )
            .populate('user', 'name email')
            .populate('classId', 'name year');

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete student
// @route   DELETE /api/hod/students/:id
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        await User.findByIdAndDelete(student.user);
        await Student.findByIdAndDelete(req.params.id);
        await Class.findByIdAndUpdate(student.classId, { $pull: { students: student._id } });

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all faculty
// @route   GET /api/hod/faculty
exports.getFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.find()
            .populate('user', 'name email isActive')
            .populate('subjects', 'name code category');
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create faculty
// @route   POST /api/hod/faculty
exports.createFaculty = async (req, res) => {
    try {
        const { name, email, password, employeeId, designation } = req.body;

        const user = await User.create({
            name, email, password: password || 'password123', role: 'faculty'
        });

        const faculty = await Faculty.create({
            user: user._id,
            employeeId,
            designation: designation || 'Assistant Professor'
        });

        const populated = await Faculty.findById(faculty._id)
            .populate('user', 'name email');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update faculty
// @route   PUT /api/hod/faculty/:id
exports.updateFaculty = async (req, res) => {
    try {
        const { name, email, designation } = req.body;
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        if (name || email) {
            await User.findByIdAndUpdate(faculty.user, { name, email });
        }

        const updated = await Faculty.findByIdAndUpdate(
            req.params.id,
            { designation },
            { new: true }
        ).populate('user', 'name email').populate('subjects', 'name code');

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete faculty
// @route   DELETE /api/hod/faculty/:id
exports.deleteFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

        await User.findByIdAndDelete(faculty.user);
        await Faculty.findByIdAndDelete(req.params.id);

        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign subject to faculty
// @route   POST /api/hod/assign-subject
exports.assignSubject = async (req, res) => {
    try {
        const { facultyId, subjectId } = req.body;

        await Subject.findByIdAndUpdate(subjectId, { faculty: facultyId });
        await Faculty.findByIdAndUpdate(facultyId, { $addToSet: { subjects: subjectId } });

        const faculty = await Faculty.findById(facultyId)
            .populate('user', 'name email')
            .populate('subjects', 'name code category');

        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all subjects
// @route   GET /api/hod/subjects
exports.getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find()
            .populate('classId', 'name year')
            .populate('faculty', 'employeeId');

        // Populate faculty user name
        const populated = await Subject.populate(subjects, {
            path: 'faculty',
            populate: { path: 'user', select: 'name' }
        });

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all feedback (HOD only)
// @route   GET /api/hod/feedback
exports.getFeedback = async (req, res) => {
    try {
        const { facultyId, subjectId } = req.query;
        let filter = {};
        if (facultyId) filter.faculty = facultyId;
        if (subjectId) filter.subject = subjectId;

        const feedback = await Feedback.find(filter)
            .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
            .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } })
            .populate('subject', 'name code')
            .sort('-createdAt');

        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get feedback analytics
// @route   GET /api/hod/feedback/analytics
exports.getFeedbackAnalytics = async (req, res) => {
    try {
        const analytics = await Feedback.aggregate([
            {
                $group: {
                    _id: { faculty: '$faculty', subject: '$subject' },
                    avgRating: { $avg: '$rating' },
                    avgTeaching: { $avg: '$teachingQuality' },
                    avgClarity: { $avg: '$clarity' },
                    avgEngagement: { $avg: '$engagement' },
                    totalResponses: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'faculties',
                    localField: '_id.faculty',
                    foreignField: '_id',
                    as: 'facultyInfo'
                }
            },
            {
                $lookup: {
                    from: 'subjects',
                    localField: '_id.subject',
                    foreignField: '_id',
                    as: 'subjectInfo'
                }
            },
            { $unwind: '$facultyInfo' },
            { $unwind: '$subjectInfo' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'facultyInfo.user',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    facultyName: '$userInfo.name',
                    subjectName: '$subjectInfo.name',
                    subjectCode: '$subjectInfo.code',
                    avgRating: { $round: ['$avgRating', 2] },
                    avgTeaching: { $round: ['$avgTeaching', 2] },
                    avgClarity: { $round: ['$avgClarity', 2] },
                    avgEngagement: { $round: ['$avgEngagement', 2] },
                    totalResponses: 1
                }
            },
            { $sort: { avgRating: -1 } }
        ]);

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all lab incharges
// @route   GET /api/hod/labincharges
exports.getLabIncharges = async (req, res) => {
    try {
        const labIncharges = await User.find({ role: 'labincharge' }).select('-password');
        res.json(labIncharges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create lab incharge
// @route   POST /api/hod/labincharges
exports.createLabIncharge = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.create({
            name,
            email,
            password: password || 'password123',
            role: 'labincharge'
        });
        res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all classes
// @route   GET /api/hod/classes
exports.getClasses = async (req, res) => {
    try {
        const classes = await Class.find().populate({
            path: 'students',
            populate: { path: 'user', select: 'name email' }
        });
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get system activity log
// @route   GET /api/hod/activity
exports.getActivity = async (req, res) => {
    try {
        const recentAssignments = await Assignment.find()
            .sort('-createdAt').limit(10)
            .populate('subject', 'name code')
            .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } });

        const recentBookings = await LabBooking.find()
            .sort('-createdAt').limit(10)
            .populate({ path: 'cr', populate: { path: 'user', select: 'name' } })
            .populate('subject', 'name code');

        res.json({ recentAssignments, recentBookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
