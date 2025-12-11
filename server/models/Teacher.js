import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const TeacherSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    schoolLevel: {
        type: String,
        enum: ['elementary', 'middle', 'high', 'all'],
        default: 'all',
        trim: true
    },
    role: {
        type: String,
        default: 'teacher',
        enum: ['teacher', 'admin']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
TeacherSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
TeacherSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
TeacherSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

const Teacher = mongoose.model('Teacher', TeacherSchema);

export default Teacher;
