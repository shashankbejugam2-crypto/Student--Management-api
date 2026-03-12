import mongoose from 'mongoose';

const departmentSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a department name'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Please add a department code'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure virtuals are included when converting document to JSON
departmentSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const Department = mongoose.model('Department', departmentSchema);

export default Department;
