import kafka from '../config/kafka.js';

const producer = kafka.producer();
let isConnected = false;

// ✅ NEW — retry wrapper so producer waits for Kafka to be ready
const connectWithRetry = async (retries = 10) => {
    while (retries > 0) {
        try {
            await producer.connect();
            return; // success — exit the loop
        } catch (err) {
            retries--;
            console.log(`⏳ Kafka Producer not ready, retrying in 5s... (${retries} attempts left)`);
            await new Promise(res => setTimeout(res, 5000));
        }
    }
    throw new Error('❌ Kafka Producer failed to connect after all retries');
};

/**
 * Connect the Kafka producer (called once at startup).
 */
export const connectProducer = async () => {
    try {
        // ✅ CHANGED — use retry instead of direct connect
        await connectWithRetry();
        isConnected = true;
        console.log('✅ Kafka Producer connected');
    } catch (error) {
        isConnected = false;
        console.warn('⚠️  Kafka Producer connection failed:', error.message);
        console.warn('   Student creation will still work, but notifications will be skipped.');
    }
};

/**
 * Send a "student added" notification to the Kafka topic.
 * Fire-and-forget — errors are logged but do not propagate.
 *
 * @param {Object} studentData - The created student document
 */
export const sendStudentAddedNotification = async (studentData) => {
    if (!isConnected) {
        console.warn('⚠️  Kafka Producer not connected — skipping notification.');
        return;
    }

    try {
        const message = {
            event: 'STUDENT_ADDED',
            student: {
                name: studentData.name,
                email: studentData.email,
                enrollmentNo: studentData.enrollmentNo,
                department: studentData.department,
                year: studentData.year,
                phone: studentData.phone,
            },
            timestamp: new Date().toISOString(),
        };

        await producer.send({
            topic: 'student-added',
            messages: [
                {
                    key: studentData.enrollmentNo,
                    value: JSON.stringify(message),
                },
            ],
        });

        console.log(`📤 Kafka: Published STUDENT_ADDED event for "${studentData.name}"`);
    } catch (error) {
        console.error('❌ Kafka Producer send error:', error.message);
    }
};

export default producer;