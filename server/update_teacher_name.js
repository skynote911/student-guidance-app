
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Teacher from './models/Teacher.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-guidance-app';

async function updateName() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find the teacher - assuming the one used recently
        // Based on logs it was master@school.com
        const email = 'master@school.com';

        console.log(`Searching for teacher with email: ${email}`);
        const teacher = await Teacher.findOne({ email });

        if (!teacher) {
            console.log('❌ Teacher not found. Listing all teachers:');
            const allTeachers = await Teacher.find();
            allTeachers.forEach(t => console.log(` - ${t.email}: ${t.name}`));

            // If there is only one teacher, update that one
            if (allTeachers.length === 1) {
                console.log('Updating the single existing teacher...');
                allTeachers[0].name = '마스터';
                await allTeachers[0].save();
                console.log('✅ Updated name to "마스터"');
            }
        } else {
            teacher.name = '마스터';
            await teacher.save();
            console.log(`✅ Updated teacher (${email}) name to "마스터"`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
    }
}

updateName();
