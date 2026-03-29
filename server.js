import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import studentRoutes from './routes/studentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { connectProducer } from './services/kafkaProducer.js';
import { startPrincipalNotificationConsumer } from './services/kafkaConsumer.js';

dotenv.config();

// Connect to database
connectDB();

// Initialize Kafka producer & consumer (non-blocking)
connectProducer();
startPrincipalNotificationConsumer();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/students', studentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);


// Basic Welcome Route
app.get('/', (req, res) => {
    res.send('College Student Management API is running...');
});

const PORT = process.env.PORT || 5078;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
