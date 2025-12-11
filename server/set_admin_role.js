
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Teacher from './models/Teacher.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-guidance-app';

async function setAdminRole() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'master@school.com';
        console.log(`Searching for teacher with email: ${email}`);

        const teacher = await Teacher.findOne({ email });

        if (!teacher) {
            console.log('❌ Teacher not found.');
            // Fallback: update the single user if exists
            const allTeachers = await Teacher.find();
            if (allTeachers.length === 1) {
                console.log('Updating the single existing teacher to admin...');
                allTeachers[0].role = 'admin';
                await allTeachers[0].save();
                console.log('✅ Updated role to "admin"');
            }
        } else {
            teacher.role = 'admin';
            await teacher.save();
            console.log(`✅ Updated teacher (${email}) role to "admin"`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
    }
}

setAdminRole();
