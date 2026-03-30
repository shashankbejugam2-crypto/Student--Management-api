import express from 'express';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    subscribeToPush,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Order matters: /unread-count and /read-all before /:id
router.get('/unread-count', protect, getUnreadCount);
router.put('/read-all', protect, markAllAsRead);
router.post('/subscribe', protect, subscribeToPush);

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);

export default router;
