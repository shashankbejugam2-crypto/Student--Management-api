import Notification from '../models/Notification.js';
import PushSubscription from '../models/PushSubscription.js';

// @desc    Get all notifications for the logged-in principal
// @route   GET /api/notifications
// @access  Private (Principal)
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 });

        res.json({ data: notifications });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private (Principal)
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false,
        });

        res.json({ data: { unreadCount: count } });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (Principal)
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ data: notification });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private (Principal)
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );

        res.json({ data: { message: 'All notifications marked as read' } });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Subscribe to Web Push Notifications
// @route   POST /api/notifications/subscribe
// @access  Private
export const subscribeToPush = async (req, res) => {
    try {
        const subscription = req.body;

        // Upsert the subscription into the DB based on endpoint
        await PushSubscription.findOneAndUpdate(
            { endpoint: subscription.endpoint },
            { 
                user: req.user._id, 
                endpoint: subscription.endpoint, 
                keys: subscription.keys 
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(201).json({ message: 'Push subscription saved successfully.' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Already subscribed' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};
