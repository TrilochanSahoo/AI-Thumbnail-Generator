import fs from "fs";
import path from "path";
import "dotenv"
import axios from "axios";
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


function isValidJson(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}


async function generateWithRetry(contents: Part[], retries = 2) {
  let attempt = 0;
  let responseText = "";

  while (attempt <= retries) {
    try {
      const result = await generativeModel.generateContent(contents);
      responseText = await result.response.text();
      console.log(responseText)
      if (isValidJson(responseText)) {
        return JSON.parse(responseText); // Return parsed JSON if valid
      } else {
        console.warn(`Attempt ${attempt + 1}: Invalid JSON, retrying...`);
      }
    } catch (err) {
      console.error(`Attempt ${attempt + 1}: Error`, err);
    }

    attempt++;
  }

  throw new Error("Failed to get valid JSON after retries");
}

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

    const generatedUploadedUrl: string[] = []



    // refine the prompts 

    const Sys_txt_prompt = `
    You are an expert AI image prompt generator.  
    Your task is to take a user's input, analyze the user prompt, correct if there is any typo mistakes, fixed it, then rephrase and generate into 2 detailed image prompts. Each prompts must contains detailing of small small changes.Each prompt should be in a different style. If you think border or small icons or small shapes need to be included then include details in the prompt so that image should generate properly. 

    Rules: 
    - Each generated prompt must contain the title from the user's prompt given, enviornment/background where the subject is placed, deitals & composition (pose,mood,perspective, lighting), style/medium (e.g., photorealistic, anime, cyberpunk digital art, watercolor painting, oil painting, cinematic, 3D render, low-poly, etc.)
    - Each Image prompt must contains the details of images which are given by user.
    - If it is a thumbnail based then add details of the character and place it one side and the title to other side.
    - Take the user request and return a JSON object with:
        - "prompts" (array of 2 different style variations)
        example : {
        "prompts" : ["prompt1","prompt2"]
        }
    - Do NOT return anything except valid JSON.

    Examples-1:

    User Input : Create a thumbnail of clash of clans game for the given person in the given image.
    {
    "prompts" : [
    "Create a thumbnail image with the title 'Class of Clan' displayed prominently.Only use the aspect ratio of the second image (do not use its content or style). Feature the provided character, cropped place one side of the image either Left or right and other side place the text. Then modified to wear a regal king outfit (crown, royal robe, armor details). The background should reflect the 'Clash of Clans' mobile game theme, with vibrant battle scenery, fantasy elements, and castle-like structures. Style the image for a gaming platform thumbnail, using soft, diffused highlights and eliminating harsh shadows to make the character and title stand out clearly.",

    "Create a thumbnail image with the title "Class of Clan" displayed prominently. Maintain the aspect ratio of the second image (only the ratio, not its style or content). Use the provided character, but instead of a static stance, position them in a dynamic battle-ready pose (slightly angled, holding a weapon or standing in a heroic stance). Crop and place the character on one side (left or right), with the bold title text occupying the opposite side.
    Modify the character to wear a regal king outfit (ornate crown, royal robe, golden armor details), making it more epic and battle-oriented. The background should capture the Clash of Clans fantasy environment, featuring castle towers, banners, and glowing magical battlefields.
    Style the image in a high-energy fantasy digital painting style, with vivid colors, glowing magical accents, and dramatic light beams to emphasize the character and text. Use stylized highlights and soft gradients instead of flat lighting, giving the image a cinematic, poster-like effect suitable for a gaming platform thumbnail."
    ] 
  }

  Example-2:
     
    User Input : Create a educational thumbnail design using the provided character for teaching Rust in tech. The title will be Rust in 10 min.
    {
    "prompts" : [
    "Create a photorealistic educational thumbnail for a tutorial titled "Rust in 10 Min". The thumbnail features the individual from the provided image, re-imagined as a tech-savvy instructor with laptop. They are positioned centrally, looking directly at the viewer with a friendly and approachable expression. The background is a clean, modern tech environment, possibly a subtly blurred office or studio setting with soft ambient lighting. Subtle graphic elements related to programming, like abstract code snippets or circuit board patterns and with some coding letters like matrix pattern, are faintly visible in the background. The title "Rust in 10 Min" is displayed prominently in a clean with thick borders, sans-serif font at the top of the image, with the word "Rust" slightly larger or in a contrasting color to emphasize the programming language,in the number 10 instead of 0 is with Rust Icon. The image is behide the person and the person have litle bit glow in background. In the left below corner have small floating social media icons. The overall mood is informative and engaging, with crisp details and realistic textures.",

    "Create a dynamic and visually engaging thumbnail for \"Rust in 10 min\". The thumbnail features the individual from the provided image, re-imagined as a tech-savvy instructor with laptop. They are positioned in the left side, looking directly at the viewer with a friendly and approachable expression. The background is a clean, modern tech environment, possibly a subtly blurred office or studio setting with soft ambient lighting of FANG compinies. Subtle graphic elements related to programming, like abstract code snippets and a curve up-down path like structure from left to right like roadmap with 2-3 pins, are faintly visible in the background. The title "Rust in 10 Min" is displayed prominently in a clean with thick borders, sans-serif font at the right side of the image, with the word "Rust" slightly larger or in a contrasting color to emphasize the programming language,in the number 10 instead of 0 is with Rust Icon. An arrow pointing from title to person. The overall mood is informative and engaging, with crisp details and realistic textures."
    ] 
  }

    `

    // user image upload to cloudinary 
    let uploadedImg: UploadedImage[] = []

    if (images && images.length > 0) {
      isimgPresent = true;
      uploadedImg = await Promise.all(
        images.map((img: string) => uploadBase64ToCloudinary(img, "uploads"))
      );
    }

    const contents: Part[] = [
      { text: Sys_txt_prompt },
      {
        text: `${prompt} | Image Present: ${isimgPresent} | Aspect Ratio: 16:9 | Picture size will be 1289×724`
      }
    ];

    for (const url of images) {
      contents.push({
        inlineData: {
          mimeType: "image/png", // or "image/jpeg"
          data: url.replace(/^data:image\/\w+;base64,/, ""),
        }
      });
    }

    // prompt generation 

    console.log(contents)

    const ModifiedPromptResults = await generateWithRetry(contents);

    console.log(ModifiedPromptResults)


    // const imagePath = path.join(process.cwd(), "public", "hitesh_chai_code.avif");

    // const imageData = fs.readFileSync(imagePath);
    // const base64Image = imageData.toString("base64");
    let imgAspectPath = ""

    if (aspect === "1:1") {
      imgAspectPath = "aspect_1_1.avif"
    } else if (aspect === "2:3") {
      imgAspectPath = "aspect_2_3"
    } else if (aspect === "3:2") {
      imgAspectPath = "aspect_3_2"
    } else if (aspect === "4:5") {
      imgAspectPath = "aspect_4_5"
    } else {
      imgAspectPath = "aspect2.png"
    }

    const imagePath2 = path.join(process.cwd(), "public", imgAspectPath);

    const imageData2 = fs.readFileSync(imagePath2);
    const base64Image2 = imageData2.toString("base64");

    if (ModifiedPromptResults && ModifiedPromptResults.prompts.length > 0) {

      await Promise.all(
        ModifiedPromptResults.prompts.map(async (txtPrompt:string) => {
          let imgPrompts: Part[] = [
            { text: `${txtPrompt}. Aspect ration: ${aspect}` },
          ]
          if (uploadedImg) {
            imgPrompts = [
              { text: `${txtPrompt}` },
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


