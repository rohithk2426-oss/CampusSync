const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    category: {
        type: String,
        enum: ['theory', 'lab', 'lab_integrated'],
        required: true
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        default: null
    },
    hoursPerSession: {
        type: Number,
        default: 1,
        validate: {
            validator: function (v) {
                if (this.category === 'lab') return [2, 4].includes(v);
                if (this.category === 'lab_integrated') return [2, 4].includes(v);
                return v >= 1;
            },
            message: 'Lab subjects must have 2 or 4 hour sessions'
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);
