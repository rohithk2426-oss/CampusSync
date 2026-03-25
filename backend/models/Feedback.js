const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    teachingQuality: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    clarity: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    engagement: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    comment: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// One feedback per student per subject
feedbackSchema.index({ student: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
