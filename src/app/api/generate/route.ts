import { GoogleGenAI, Modality } from "@google/genai";
import fs from "fs";
import path from "path";
import "dotenv"

const geminiAi = new GoogleGenAI({});


import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from "next/server";

// This guard clause is excellent practice.
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




export async function POST(request:Request) {
    try {

        const promptText =
            `A photorealistic close-up portrait of an elderly Japanese ceramicist with
deep, sun-etched wrinkles and a warm, knowing smile. He is carefully
inspecting a freshly glazed tea bowl. The setting is his rustic,
sun-drenched workshop. The scene is illuminated by soft, golden hour light
streaming through a window, highlighting the fine texture of the clay.`

        // const response = await geminiAi.models.generateContent({
        //     model: "gemini-2.5-flash-image-preview",
        //     contents: prompt,
        // });

  const imagePath = path.join(process.cwd(), "public", "hitesh_chai_code.avif");

  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString("base64");

  const imagePath2 = path.join(process.cwd(), "public", "aspect2.png");

  const imageData2 = fs.readFileSync(imagePath2);
  const base64Image2 = imageData2.toString("base64");

  const prompt = [
    { text: "Create a thumbnail image with the title 'Class of Clan' displayed prominently.Only use the aspect ratio of the second image (do not use its content or style). Feature the provided character, cropped place one side of the image either Left or right and other side place the text. Then modified to wear a regal king outfit (crown, royal robe, armor details). The background should reflect the 'Clash of Clans' mobile game theme, with vibrant battle scenery, fantasy elements, and castle-like structures. Style the image for a gaming platform thumbnail, using soft, diffused highlights and eliminating harsh shadows to make the character and title stand out clearly." },
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image,
      },
    },
    {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64Image2, // base64 string of second image
    },
  },
  ];

        // const result = await imageGenerationModel.generateContent(prompt);
        // const response = await result.response;

        // const parts = response.candidates?.[0]?.content?.parts;

        // if(parts && parts.length > 0){
        //     for (const part of parts) {
        //         // console.log(part)
        //         if (part.text) {
        //             console.log(part.text);
        //         } 
        //         else if (part.inlineData) {
        //             const imageData = part.inlineData.data;
        //             if(imageData){
        //                 const buffer = Buffer.from(imageData, "base64");
        //                 fs.writeFileSync("gemini-native-image.png", buffer);
        //                 console.log("Image saved as gemini-native-image.png");
        //             }
        //         }
        //     }
        // }

        return NextResponse.json({message : "done..."});

        
    } catch (error) {
        console.log(error)
        
    }
}


