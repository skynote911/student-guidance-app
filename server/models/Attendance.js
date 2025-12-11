import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    status: {
        type: String,
        enum: ['PRESENT', 'LATE', 'ABSENT', 'EARLY_LEAVE'],
        default: 'PRESENT'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure one attendance record per student per day
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
