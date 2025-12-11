import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    studentId: {
        type: String,
        required: true,
        trim: true
    },
    mileage: {
        type: Number,
        default: 0
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure studentId is unique per teacher (optional, but good practice if studentIds differ by class)
// For now, assuming studentId is globally unique or managed by teacher
studentSchema.index({ teacherId: 1, studentId: 1 }, { unique: true });

const Student = mongoose.model('Student', studentSchema);

export default Student;
