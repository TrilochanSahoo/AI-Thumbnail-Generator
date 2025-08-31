import fs from "fs";
import path from "path";
import "dotenv"
import { NextResponse } from "next/server";
import { generativeModel, imageGenerationModel } from "@/lib/gemini";
import { uploadBase64ToCloudinary } from "@/lib/cloudinary";
import { Part } from "@google/generative-ai";


type UploadedImage = {
  url: string;
  publicId: string;
};

type ImgPrompt =
  | { text: string }
  | { imageUrl: string }
  | { inlineData: { mimeType: string; data: string } };

export async function POST(req: Request) {
  try {

    let isimgPresent = false

    const {
      prompt = "",
      aspect = "16:9",
      hiRes = false,
      textStyle = "",
      images
    } = await req.json()

    const generatedUploadedUrl : string[] = []


    // refine the prompts 

    const Sys_txt_prompt = `
    You are an expert AI image prompt generator.  
    Your task is to take a single user idea or description and expand it into 2 detailed image prompts, each in a different style. 

    Rules: 
    - Each generated prompt must include the subject from the user's prompt given, enviornment/background where the subject is placed, deitals & composition (pose,mood,perspective, lighting), style/medium (e.g., photorealistic, anime, cyberpunk digital art, watercolor painting, oil painting, cinematic, 3D render, low-poly, etc.)
    - If it is a thumbnail based then add details of the character and place it one side and the title to other side.
    - Take the user request and return a JSON object with:
        - "prompts" (array of 2 different style variations)
        example : {
        "prompts" : ["prompt1","prompt2"]
        }
    - Do NOT return anything except valid JSON.

    Examples:

    User Input : Create a thumbnail of clash of clans game for the given person in the given image.
    {
    "prompts" : [
    "Create a thumbnail image with the title 'Class of Clan' displayed prominently.Only use the aspect ratio of the second image (do not use its content or style). Feature the provided character, cropped place one side of the image either Left or right and other side place the text. Then modified to wear a regal king outfit (crown, royal robe, armor details). The background should reflect the 'Clash of Clans' mobile game theme, with vibrant battle scenery, fantasy elements, and castle-like structures. Style the image for a gaming platform thumbnail, using soft, diffused highlights and eliminating harsh shadows to make the character and title stand out clearly.",

    "Create a thumbnail image with the title "Class of Clan" displayed prominently. Maintain the aspect ratio of the second image (only the ratio, not its style or content). Use the provided character, but instead of a static stance, position them in a dynamic battle-ready pose (slightly angled, holding a weapon or standing in a heroic stance). Crop and place the character on one side (left or right), with the bold title text occupying the opposite side.

Modify the character to wear a regal king outfit (ornate crown, royal robe, golden armor details), making it more epic and battle-oriented. The background should capture the Clash of Clans fantasy environment, featuring castle towers, banners, and glowing magical battlefields.

Style the image in a high-energy fantasy digital painting style, with vivid colors, glowing magical accents, and dramatic light beams to emphasize the character and text. Use stylized highlights and soft gradients instead of flat lighting, giving the image a cinematic, poster-like effect suitable for a gaming platform thumbnail."
    ] 
  }

    `

    // user image upload to cloudinary 
    let uploadedImg: UploadedImage[]

    if (images && images.length > 0) {
      isimgPresent = true
      uploadedImg = await Promise.all(
        images.map((img: string) => uploadBase64ToCloudinary(img, "uploads"))
      );
    }

    // prompt generation 

    const result = await generativeModel.generateContent([
      { text: Sys_txt_prompt },
      { text: prompt + "Image Present :" + isimgPresent + "Aspect Ratio :" + aspect }
    ]);
    const response = await result.response.text()
    const ModifiedPromptResults: { prompts: string[] } = JSON.parse(response);

    console.log(ModifiedPromptResults)


    // const imagePath = path.join(process.cwd(), "public", "hitesh_chai_code.avif");

    // const imageData = fs.readFileSync(imagePath);
    // const base64Image = imageData.toString("base64");

    const imagePath2 = path.join(process.cwd(), "public", "aspect2.png");

    const imageData2 = fs.readFileSync(imagePath2);
    const base64Image2 = imageData2.toString("base64");

    if (ModifiedPromptResults && ModifiedPromptResults.prompts.length > 0) {

      await Promise.all(
        ModifiedPromptResults.prompts.map(async (txtPrompt) => {
          let imgPrompts: Part[] = [
            { text: `${txtPrompt}. Aspect ration: ${aspect}` },
          ]
          if (uploadedImg) {
            imgPrompts = [
              { text: `${txtPrompt}. Aspect ration: ${aspect}` },
              ...images.map((base64: string) => ({
                inlineData: {
                  mimeType: "image/png", // or "image/jpeg"
                  data: base64.replace(/^data:image\/\w+;base64,/, ""),
                },
              })),
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Image2, // base64 string of second image
                },
              },
            ];
          }
  
          const result = await imageGenerationModel.generateContent(imgPrompts);
          const response = await result.response;
  
          const parts = response.candidates?.[0]?.content?.parts;
  
          if (parts && parts.length > 0) {
            for (const part of parts) {
              // console.log(part)
              if (part.text) {
                console.log("Text: " + part.text);
              }
              else if (part.inlineData) {
                const imageData = part.inlineData.data;
                if (imageData) {

                  const buffer = Buffer.from(imageData, "base64")
                  fs.writeFileSync(`geminiAi-native-image.png`, buffer)
                  console.log("Image saved successfully")
                  
                  const url = await uploadBase64ToCloudinary(`data:image/png;base64,${imageData}`, "gemini-outputs");
                  generatedUploadedUrl.push(url.url);
                  console.log("clodinary")
                  // console.log("Uploaded to Cloudinary:", url.url);
                }
              }
            }
          }
        })
      )

    }

    return NextResponse.json({ message: generatedUploadedUrl });


  } catch (error) {
    console.log(error)

  }
}


