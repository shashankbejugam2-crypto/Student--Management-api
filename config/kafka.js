import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Single consistent variable name — matches your .env KAFKA_BROKERS
const brokers = (process.env.KAFKA_BROKERS || 'kafka:9092').split(',');

const kafka = new Kafka({
    clientId: 'college-student-mgmt',
    brokers: brokers,           // ✅ actually uses the brokers variable now
    retry: {
        initialRetryTime: 3000,   // wait 3s before first retry
        retries: 10               // try 10 times total = ~30s of retrying
    }
});

export default kafka;