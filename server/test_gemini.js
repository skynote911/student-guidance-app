

import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const model = 'gemini-1.5-flash';

console.log('Testing Gemini API...');
console.log('Model:', model);
console.log('Key length:', apiKey ? apiKey.length : 0);

async function test() {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const data = await response.json();
        console.log('Status:', response.status);
        if (response.ok) {
            console.log('Available Models:');
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log('Error:', data);
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
