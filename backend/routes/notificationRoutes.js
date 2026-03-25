const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const notif = require('../controllers/notificationController');

router.use(protect);

router.get('/', notif.getNotifications);
router.put('/read-all', notif.markAllAsRead);
router.put('/:id/read', notif.markAsRead);

module.exports = router;
