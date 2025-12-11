import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/crypto.js';
import fs from 'fs';
import path from 'path';

const IncidentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        index: true
    },
    involvedStudentIds: [{
        type: String
    }],
    incidentDate: {
        type: Date,
        default: Date.now
    },
    incidentType: {
        type: String,
        required: true
    },
    rawData: {
        type: String  // Encrypted field
    },
    aiAnalysis: {
        type: Object  // JSON summary from AI
    },
    teacherNote: {
        type: String  // Encrypted field
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    isEncrypted: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Encrypt sensitive fields before saving
IncidentSchema.pre('save', function (next) {
    if (!this.isEncrypted) {
        return next();
    }

    const encryptionKey = process.env.ENCRYPTION_KEY;

    if (!encryptionKey) {
        return next(new Error('ENCRYPTION_KEY not set in environment'));
    }

    // Regex to check if string matches encrypted format (IV:Content)
    // IV is 16 bytes = 32 hex characters
    const isEncryptedFormat = (str) => /^[0-9a-fA-F]{32}:[0-9a-fA-F]+$/.test(str);

    // Encrypt rawData if modified
    if (this.isModified('rawData') && this.rawData) {
        // Check if already encrypted using regex
        if (!isEncryptedFormat(this.rawData)) {
            this.rawData = encrypt(this.rawData, encryptionKey);
        }
    }

    // Encrypt teacherNote if modified
    if (this.isModified('teacherNote') && this.teacherNote) {
        // Check if already encrypted using regex
        if (!isEncryptedFormat(this.teacherNote)) {
            this.teacherNote = encrypt(this.teacherNote, encryptionKey);
        }
    }

    next();
});

// Method to decrypt sensitive fields
IncidentSchema.methods.decryptFields = function () {
    if (!this.isEncrypted) {
        return this;
    }

    const encryptionKey = process.env.ENCRYPTION_KEY;

    if (!encryptionKey) {
        throw new Error('ENCRYPTION_KEY not set in environment');
    }

    const decrypted = this.toObject();

    // Regex to check if string matches encrypted format
    const isEncryptedFormat = (str) => /^[0-9a-fA-F]{32}:[0-9a-fA-F]+$/.test(str);

    try {
        if (decrypted.rawData) {
            if (isEncryptedFormat(decrypted.rawData)) {
                decrypted.rawData = decrypt(decrypted.rawData, encryptionKey);
            }
            // If not in encrypted format, leave as is (recover plaintext)
        }
    } catch (error) {
        const msg = `[Decryption Error] Failed to decrypt rawData for incident ${this._id}: ${error.message}`;
        console.error(msg);
        try { fs.appendFileSync(path.join(process.cwd(), 'debug.log'), `${new Date().toISOString()} - ${msg}\n`); } catch (e) { }
        decrypted.rawData = '[Decryption Failed]';
    }

    try {
        if (decrypted.teacherNote) {
            if (isEncryptedFormat(decrypted.teacherNote)) {
                decrypted.teacherNote = decrypt(decrypted.teacherNote, encryptionKey);
            }
            // If not in encrypted format, leave as is (recover plaintext)
        }
    } catch (error) {
        const msg = `[Decryption Error] Failed to decrypt teacherNote for incident ${this._id}: ${error.message}`;
        console.error(msg);
        try { fs.appendFileSync(path.join(process.cwd(), 'debug.log'), `${new Date().toISOString()} - ${msg}\n`); } catch (e) { }
        decrypted.teacherNote = '[Decryption Failed]';
    }

    return decrypted;
};

const Incident = mongoose.model('Incident', IncidentSchema);

export default Incident;
