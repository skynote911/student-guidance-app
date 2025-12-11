import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function fixIndexes() {
    try {
        console.log('Connecting to MongoDB...');
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not defined in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const collection = mongoose.connection.collection('students');

        console.log('Listing indexes...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        // Check for the global unique index on studentId
        const badIndex = indexes.find(idx => idx.key && idx.key.studentId === 1 && idx.name !== 'teacherId_1_studentId_1');

        if (badIndex) {
            console.log(`Found problematic index: ${badIndex.name}`);
            try {
                await collection.dropIndex(badIndex.name);
                console.log(`✅ Dropped index: ${badIndex.name}`);
            } catch (e) {
                console.error(`❌ Failed to drop index: ${e.message}`);
            }
        } else {
            // Sometimes it's named 'studentId_1' specifically
            try {
                await collection.dropIndex('studentId_1');
                console.log('✅ Dropped index: studentId_1');
            } catch (e) {
                console.log('ℹ️ Index studentId_1 not found (this is good if you already fixed it).');
            }
        }

        console.log('🎉 DB Index Fix Complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixIndexes();
