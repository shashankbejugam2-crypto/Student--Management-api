import express from 'express';
import {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentStats,
} from '../controllers/studentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Order is important: /stats must come before /:id to prevent "stats" being treated as an ID
router.route('/stats').get(protect, getStudentStats);

router.route('/')
    .get(protect, getStudents)
    .post(protect, createStudent);

router.route('/:id')
    .get(protect, getStudentById)
    .put(protect, updateStudent)
    .delete(protect, deleteStudent);

export default router;
