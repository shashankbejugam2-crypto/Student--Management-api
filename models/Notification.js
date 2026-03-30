import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recipientRole: {
            type: String,
            default: 'Principal',
        },
        type: {
            type: String,
            enum: ['STUDENT_ADDED', 'STUDENT_UPDATED', 'STUDENT_DELETED'],
            default: 'STUDENT_ADDED',
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        data: {
            type: mongoose.Schema.Types.Mixed, // store full student snapshot
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
