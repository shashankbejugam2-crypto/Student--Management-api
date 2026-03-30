import kafka from '../config/kafka.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendPushNotificationToUser } from './pushService.js';
import { sendEmail } from '../utils/sendEmail.js';

const consumer = kafka.consumer({ groupId: 'principal-notification-group' });

const getPrincipal = async () => {
    return await User.findOne({ role: 'Principal' });
};

// ✅ NEW — retry wrapper so consumer waits for Kafka to be ready
const connectWithRetry = async (retries = 10) => {
    while (retries > 0) {
        try {
            await consumer.connect();
            console.log('✅ Kafka Consumer connected (principal-notification-group)');
            return;
        } catch (err) {
            retries--;
            console.log(`⏳ Kafka not ready, retrying in 5s... (${retries} attempts left)`);
            await new Promise(res => setTimeout(res, 5000));
        }
    }
    throw new Error('❌ Kafka Consumer failed to connect after all retries');
};

export const startPrincipalNotificationConsumer = async () => {
    try {
        // ✅ CHANGED — use retry instead of direct connect
        await connectWithRetry();

        await consumer.subscribe({ topic: 'student-added', fromBeginning: false });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const data = JSON.parse(message.value.toString());
                    const { student, timestamp } = data;

                    const principal = await getPrincipal();

                    if (!principal) {
                        console.warn('⚠️  No Principal user found in DB — notification not saved.');
                        return;
                    }

                    const notification = await Notification.create({
                        recipient: principal._id,
                        recipientRole: 'Principal',
                        type: 'STUDENT_ADDED',
                        title: `New Student Added: ${student.name}`,
                        message: `A new student "${student.name}" (${student.enrollmentNo}) has been enrolled in the ${student.department} department, Year ${student.year}.`,
                        data: student,
                        isRead: false,
                    });

                    await sendPushNotificationToUser(principal._id, {
                        title: notification.title,
                        body: notification.message,
                        url: '/notifications',
                    }).catch(err => console.error('Push notification failed:', err.message));

                    const adminEmail = process.env.ADMIN_EMAIL || 'admin@collegestudentmgmt.com';
                    await sendEmail({
                        email: adminEmail,
                        subject: `🚨 ${notification.title}`,
                        message: `Hello Principal ${principal.name},\n\n${notification.message}\n\nPlease review this in the dashboard.\n\nTime: ${new Date(timestamp).toLocaleString()}`,
                    });

                    console.log('\n' + '='.repeat(60));
                    console.log('📢 PRINCIPAL NOTIFICATION SAVED & PUSHED & EMAILED');
                    console.log('='.repeat(60));
                    console.log(`🎓 New Student Added!`);
                    console.log(`   Recipient    : ${principal.name} (${principal.role})`);
                    console.log(`   Email target : ${adminEmail}`);
                    console.log(`   Student      : ${student.name} (${student.enrollmentNo})`);
                    console.log(`   Department   : ${student.department}, Year ${student.year}`);
                    console.log(`   Notification : ID ${notification._id}`);
                    console.log(`   Time         : ${new Date(timestamp).toLocaleString()}`);
                    console.log('='.repeat(60) + '\n');

                } catch (err) {
                    console.error('❌ Error processing Kafka message:', err.message);
                }
            },
        });

    } catch (error) {
        // ✅ CHANGED — warn but don't crash the whole server
        console.warn('⚠️  Kafka Consumer connection failed:', error.message);
        console.warn('   The server will continue running without Kafka notifications.');
    }
};

export default consumer;