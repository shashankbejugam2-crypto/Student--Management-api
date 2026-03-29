import webPush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';
import dotenv from 'dotenv';

dotenv.config();

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webPush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:test@test.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
} else {
    console.warn('⚠️  VAPID keys not configured in .env. Web Push notifications will not work.');
}

/**
 * Send a web push notification to a specific user (to all their subscribed devices).
 * @param {string} userId - The ID of the user to notify
 * @param {object} payload - The notification payload
 */
export const sendPushNotificationToUser = async (userId, payload) => {
    try {
        // Find all subscriptions for this user
        const subscriptions = await PushSubscription.find({ user: userId });

        if (subscriptions.length === 0) {
            return; // User has no push subscriptions
        }

        const notificationPayload = JSON.stringify(payload);

        // Send to all endpoints, collect promises
        const sendPromises = subscriptions.map(async (subscription) => {
            try {
                await webPush.sendNotification(
                    {
                        endpoint: subscription.endpoint,
                        keys: subscription.keys,
                    },
                    notificationPayload
                );
            } catch (error) {
                // If the subscription is gone/unsubscribed, remove it from DB
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await PushSubscription.deleteOne({ _id: subscription._id });
                } else {
                    console.error('❌ Error sending push notification:', error);
                }
            }
        });

        await Promise.all(sendPromises);
    } catch (error) {
        console.error('❌ Failed to send push notification series:', error);
    }
};
