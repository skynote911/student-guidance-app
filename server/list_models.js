
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing with API Key:', apiKey ? apiKey.substring(0, 5) + '...' : 'NONE');

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error('API Error:', JSON.stringify(data.error, null, 2));
        } else {
            console.log('Available Models:');
            if (data.models) {
                data.models.forEach(m => {
                    console.log(`- ${m.name} (${m.displayName})`);
                    if (m.supportedGenerationMethods) {
                        console.log(`  Methods: ${m.supportedGenerationMethods.join(', ')}`);
                    }
                });
            } else {
                console.log('No models list found in response:', data);
            }
        }
    } catch (error) {
        console.error('Fetch Failed:', error);
    }
}

listModels();
