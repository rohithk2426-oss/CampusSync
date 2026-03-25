// ============================================================
// Node.js Advanced Concept: Custom EventEmitter & Non-Blocking Streams
// ============================================================
// Instead of blocking the API response with synchronous logging,
// we extend Node's native EventEmitter to fire-and-forget events.
// Behind the scenes, fs.createWriteStream appends to a log file
// without blocking the main thread.
// ============================================================

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class AppLogger extends EventEmitter {
    constructor() {
        super();

        // Create a non-blocking write stream to a log file
        const logPath = path.join(__dirname, '..', 'system_activity.log');
        this.logStream = fs.createWriteStream(logPath, { flags: 'a' });

        // ---- Register event listeners ----

        // User login event
        this.on('user_login', (data) => {
            const entry = `[${new Date().toISOString()}] LOGIN: ${data.email} (${data.role}) - IP: ${data.ip || 'unknown'}\n`;
            this.logStream.write(entry);
        });

        // User registration event
        this.on('user_registered', (data) => {
            const entry = `[${new Date().toISOString()}] REGISTER: ${data.email} (${data.role}) - Created by: ${data.createdBy || 'self'}\n`;
            this.logStream.write(entry);
        });

        // Booking events
        this.on('booking_approved', (data) => {
            const entry = `[${new Date().toISOString()}] BOOKING_APPROVED: ${data.subject} - Approved by: ${data.approvedBy}\n`;
            this.logStream.write(entry);
        });

        this.on('booking_rejected', (data) => {
            const entry = `[${new Date().toISOString()}] BOOKING_REJECTED: ${data.subject} - Reason: ${data.reason}\n`;
            this.logStream.write(entry);
        });

        // Generic activity event
        this.on('activity', (data) => {
            const entry = `[${new Date().toISOString()}] ACTIVITY: ${data.action} - ${data.details}\n`;
            this.logStream.write(entry);
        });

        console.log('📝 AppLogger initialized with non-blocking stream');
    }
}

// Export a singleton instance
module.exports = new AppLogger();
