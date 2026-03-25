const LabBooking = require('../models/LabBooking');
const Notification = require('../models/Notification');
const Student = require('../models/Student');

// @desc    Get lab incharge dashboard
// @route   GET /api/labincharge/dashboard
exports.getDashboard = async (req, res) => {
    try {
        const pending = await LabBooking.countDocuments({ status: 'pending' });
        const approved = await LabBooking.countDocuments({ status: 'approved' });
        const rejected = await LabBooking.countDocuments({ status: 'rejected' });
        const total = await LabBooking.countDocuments();

        const recentBookings = await LabBooking.find()
            .sort('-createdAt')
            .limit(5)
            .populate({ path: 'cr', populate: { path: 'user', select: 'name' } })
            .populate('subject', 'name code');

        res.json({ pending, approved, rejected, total, recentBookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all lab bookings
// @route   GET /api/labincharge/bookings
exports.getBookings = async (req, res) => {
    try {
        const { status, date, search } = req.query;
        let filter = {};
        if (status) filter.status = status;
        if (date) {
            const d = new Date(date);
            filter.date = {
                $gte: new Date(d.setHours(0, 0, 0, 0)),
                $lte: new Date(d.setHours(23, 59, 59, 999))
            };
        }

        let bookings = await LabBooking.find(filter)
            .populate({ path: 'cr', populate: { path: 'user', select: 'name email' } })
            .populate('subject', 'name code category')
            .sort('-createdAt');

        if (search) {
            bookings = bookings.filter(b =>
                b.subject?.name?.toLowerCase().includes(search.toLowerCase()) ||
                b.cr?.user?.name?.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve booking
// @route   PUT /api/labincharge/bookings/:id/approve
exports.approveBooking = async (req, res) => {
    try {
        const booking = await LabBooking.findByIdAndUpdate(
            req.params.id,
            { status: 'approved', labIncharge: req.user._id },
            { new: true }
        )
            .populate({ path: 'cr', populate: { path: 'user', select: 'name' } })
            .populate('subject', 'name code');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Notify the CR
        const student = await Student.findById(booking.cr._id || booking.cr);
        if (student) {
            await Notification.create({
                user: student.user,
                title: 'Lab Booking Approved',
                message: `Your lab booking for ${booking.subject.name} has been approved`,
                type: 'lab_booking'
            });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject booking
// @route   PUT /api/labincharge/bookings/:id/reject
exports.rejectBooking = async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        const booking = await LabBooking.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', rejectionReason, labIncharge: req.user._id },
            { new: true }
        )
            .populate({ path: 'cr', populate: { path: 'user', select: 'name' } })
            .populate('subject', 'name code');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Notify the CR
        const student = await Student.findById(booking.cr._id || booking.cr);
        if (student) {
            await Notification.create({
                user: student.user,
                title: 'Lab Booking Rejected',
                message: `Your lab booking for ${booking.subject.name} was rejected: ${rejectionReason}`,
                type: 'lab_booking'
            });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get lab schedule
// @route   GET /api/labincharge/schedule
exports.getSchedule = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let filter = { status: 'approved' };

        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else {
            // Default: current week
            const now = new Date();
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            filter.date = { $gte: startOfWeek, $lte: endOfWeek };
        }

        const schedule = await LabBooking.find(filter)
            .populate({ path: 'cr', populate: { path: 'user', select: 'name' } })
            .populate('subject', 'name code')
            .sort('date');

        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// MongoDB Advanced Concept: Aggregation Pipeline
// ============================================================
// Uses $match, $lookup, $unwind, $group, $sort stages to
// perform complex analytics on booking data — like SQL JOINs,
// GROUP BY, and aggregate functions (SUM, AVG).
// ============================================================

// @desc    Get advanced booking analytics using aggregation pipeline
// @route   GET /api/labincharge/analytics/advanced
exports.getBookingAnalytics = async (req, res) => {
    try {
        const analytics = await LabBooking.aggregate([
            // Stage 1: $match — Filter only approved bookings
            {
                $match: { status: 'approved' }
            },

            // Stage 2: $lookup — JOIN with 'subjects' collection (like SQL JOIN)
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'subject',
                    foreignField: '_id',
                    as: 'subjectInfo'
                }
            },

            // Stage 3: $unwind — Deconstruct the joined array into individual docs
            {
                $unwind: '$subjectInfo'
            },

            // Stage 4: $lookup — JOIN with 'students' collection (CR info)
            {
                $lookup: {
                    from: 'students',
                    localField: 'cr',
                    foreignField: '_id',
                    as: 'crInfo'
                }
            },
            { $unwind: { path: '$crInfo', preserveNullAndEmptyArrays: true } },

            // Stage 5: $group — Group by subject and compute aggregated stats
            {
                $group: {
                    _id: '$subjectInfo.name',
                    subjectCode: { $first: '$subjectInfo.code' },
                    category: { $first: '$subjectInfo.category' },
                    totalBookings: { $sum: 1 },
                    avgPeriodsPerBooking: { $avg: { $size: '$periods' } },
                    totalPeriodsUsed: { $sum: { $size: '$periods' } },
                    uniqueCRs: { $addToSet: '$cr' },
                    lastBookingDate: { $max: '$date' }
                }
            },

            // Stage 6: $project — Shape the final output
            {
                $project: {
                    _id: 0,
                    subjectName: '$_id',
                    subjectCode: 1,
                    category: 1,
                    totalBookings: 1,
                    avgPeriodsPerBooking: { $round: ['$avgPeriodsPerBooking', 1] },
                    totalPeriodsUsed: 1,
                    uniqueCRCount: { $size: '$uniqueCRs' },
                    lastBookingDate: 1
                }
            },

            // Stage 7: $sort — Sort by most bookings first
            {
                $sort: { totalBookings: -1 }
            }
        ]);

        // Also get overall stats
        const overallStats = await LabBooking.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            subjectAnalytics: analytics,
            statusBreakdown: overallStats,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
