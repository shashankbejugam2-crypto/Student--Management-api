import Student from '../models/Student.js';
import { sendStudentAddedNotification } from '../services/kafkaProducer.js';

// @desc    Get all students
// @route   GET /api/students
// @access  Private
export const getStudents = async (req, res) => {
    try {
        const search = req.query.search || '';
        const query = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { enrollmentNo: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ]
        } : {};

        const students = await Student.find(query).sort({ createdAt: -1 });
        res.json({ data: students });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (student) {
            res.json({ data: student });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create student
// @route   POST /api/students
// @access  Private
export const createStudent = async (req, res) => {
    try {
        const student = await Student.create(req.body);

        // Fire-and-forget: send Kafka notification to principal
        sendStudentAddedNotification(student).catch((err) =>
            console.error('Kafka notification error:', err.message)
        );

        res.status(201).json({ data: student });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email or Enrollment No. already exists' });
        }
        res.status(400).json({ message: error.message || 'Invalid student data' });
    }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
export const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (student) {
            const updatedStudent = await Student.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            res.json({ data: updatedStudent });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email or Enrollment No. already exists' });
        }
        res.status(400).json({ message: error.message || 'Invalid student data' });
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
export const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (student) {
            await student.deleteOne();
            res.json({ data: { message: 'Student removed' } });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get student stats for dashboard
// @route   GET /api/students/stats
// @access  Private
export const getStudentStats = async (req, res) => {
    try {
        const total = await Student.countDocuments();
        const active = await Student.countDocuments({ status: 'Active' });
        const inactive = total - active;

        // Aggregate by department
        const deptAgg = await Student.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } }
        ]);
        const departments = {};
        deptAgg.forEach(d => {
            if (d._id) departments[d._id] = d.count;
        });

        // Aggregate by year
        const yearAgg = await Student.aggregate([
            { $group: { _id: '$year', count: { $sum: 1 } } }
        ]);
        const yearWise = {};
        yearAgg.forEach(y => {
            if (y._id) yearWise[`Year ${y._id}`] = y.count;
        });

        res.json({
            data: {
                total,
                active,
                inactive,
                departments,
                yearWise
            }
        });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
