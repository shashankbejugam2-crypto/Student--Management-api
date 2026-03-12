import mongoose from 'mongoose';

const studentSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        phone: {
            type: String,
            required: [true, 'Please add a phone number'],
        },
        department: {
            type: String,
            required: [true, 'Please add a department'],
        },

        year: {
            type: Number,
            required: [true, 'Please add a year'],
            min: 1,
            max: 4,
        },
        enrollmentNo: {
            type: String,
            required: [true, 'Please add an enrollment number'],
            unique: true,
        },
        address: {
            type: String,
        },
        dob: {
            type: Date,
            required: [true, 'Please add date of birth'],
        },
        gender: {
            type: String,
            required: [true, 'Please add gender'],
            enum: ['Male', 'Female', 'Other'],
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
    },
    {
        timestamps: true,
    }
);

// Ensure virtuals are included when converting document to JSON
studentSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        // Don't leak MongoDB specific fields and internal versioning
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
