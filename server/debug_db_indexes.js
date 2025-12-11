
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-guidance-app';

async function checkIndexes() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const collection = mongoose.connection.collection('students');
        const indexes = await collection.indexes();

        console.log('📊 Current Indexes on "students" collection:');
        console.log(JSON.stringify(indexes, null, 2));

        const teachers = await mongoose.connection.collection('teachers').find().toArray();
        console.log(`\n👩‍🏫 Total Teachers: ${teachers.length}`);
        teachers.forEach(t => console.log(`   - ${t.email} (${t._id})`));

        const students = await collection.find().toArray();
        console.log(`🎓 Total Students: ${students.length}`);

        if (students.length > 0) {
            console.log('\nSample Student:', students[0]);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
    }
}

checkIndexes();
