import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Student from './models/Student.js';

dotenv.config();

connectDB();

const mockStudents = [
    {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@college.edu',
        phone: '9876543210',
        department: 'Computer Science',
        year: 3,
        enrollmentNo: 'CS2023001',
        address: '12, MG Road, Bangalore',
        dob: '2003-05-15',
        gender: 'Male',
        status: 'Active',
    },
    {
        name: 'Priya Patel',
        email: 'priya.patel@college.edu',
        phone: '9876543211',
        department: 'Electronics',
        year: 2,
        enrollmentNo: 'EC2024002',
        address: '45, Park Street, Mumbai',
        dob: '2004-02-20',
        gender: 'Female',
        status: 'Active',
    },
    {
        name: 'Rohan Mehta',
        email: 'rohan.mehta@college.edu',
        phone: '9876543212',
        department: 'Mechanical',
        year: 4,
        enrollmentNo: 'ME2022003',
        address: '78, Civil Lines, Delhi',
        dob: '2002-11-08',
        gender: 'Male',
        status: 'Active',
    },
    {
        name: 'Ananya Reddy',
        email: 'ananya.reddy@college.edu',
        phone: '9876543213',
        department: 'Computer Science',
        year: 1,
        enrollmentNo: 'CS2025004',
        address: '23, Jubilee Hills, Hyderabad',
        dob: '2005-07-12',
        gender: 'Female',
        status: 'Active',
    },
    {
        name: 'Vikram Singh',
        email: 'vikram.singh@college.edu',
        phone: '9876543214',
        department: 'Civil',
        year: 3,
        enrollmentNo: 'CE2023005',
        address: '56, Sector 17, Chandigarh',
        dob: '2003-09-25',
        gender: 'Male',
        status: 'Inactive',
    },
    {
        name: 'Sneha Iyer',
        email: 'sneha.iyer@college.edu',
        phone: '9876543215',
        department: 'Electronics',
        year: 2,
        enrollmentNo: 'EC2024006',
        address: '89, Anna Nagar, Chennai',
        dob: '2004-01-30',
        gender: 'Female',
        status: 'Active',
    },
];

const importData = async () => {
    try {
        await User.deleteMany();
        await Student.deleteMany();

        // Create Admin User
        await User.create({
            name: 'Dr. Admin Principal',
            username: 'admin',
            password: 'admin123',
            role: 'Principal',
        });

        // Insert Mock Students
        await Student.insertMany(mockStudents);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Student.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
