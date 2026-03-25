const mongoose = require('mongoose');

const labBookingSchema = new mongoose.Schema({
    cr: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    periods: [{
        type: Number,
        min: 1,
        max: 8
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    labIncharge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    labName: {
        type: String,
        default: 'Main Lab'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LabBooking', labBookingSchema);
