const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const appLogger = require('../utils/logger');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Get role-specific profile
        let profile = null;
        if (user.role === 'student') {
            profile = await Student.findOne({ user: user._id }).populate('classId subjects');
        } else if (user.role === 'faculty') {
            profile = await Faculty.findOne({ user: user._id }).populate('subjects');
        }

        // Fire-and-forget event (non-blocking)
        appLogger.emit('user_login', {
            email: user.email,
            role: user.role,
            ip: req.ip
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        let profile = null;

        if (user.role === 'student') {
            profile = await Student.findOne({ user: user._id }).populate('classId subjects');
        } else if (user.role === 'faculty') {
            profile = await Faculty.findOne({ user: user._id }).populate('subjects');
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register user (HOD only)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password, role });

        // Fire-and-forget event (non-blocking)
        appLogger.emit('user_registered', {
            email: user.email,
            role: user.role,
            createdBy: req.user?.email || 'self'
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
