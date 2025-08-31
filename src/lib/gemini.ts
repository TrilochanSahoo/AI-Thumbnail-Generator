import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('Missing GOOGLE_API_KEY in .env.local');
}

// Initialize the SDK with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);


// Shared generation config
const generationConfig = {
  maxOutputTokens: 8192,
  temperature: 1,
  topP: 0.95,
  candidateCount: 1,

};
const IMAGE_MODEL_ID = 'gemini-2.5-flash-image-preview';

const TEXT_MODEL_ID = 'gemini-2.5-flash-lite';
// Client for generating images
export const imageGenerationModel = genAI.getGenerativeModel({
  model: IMAGE_MODEL_ID,
  generationConfig,
});

// Client for text-based tasks, specifically configured to output JSON
export const generativeModel = genAI.getGenerativeModel({
  model: TEXT_MODEL_ID,
  generationConfig: {
    ...generationConfig,
    responseMimeType: 'application/json', // This is crucial for the rewrite API
  },
});