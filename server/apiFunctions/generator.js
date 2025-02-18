import OpenAI from "openai/index.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { downloadImageStream } from "../fetch-script.js";
import { exit } from "process";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function main(base64code, stylePrompt) {
  try {
    // Generate a description of the image

    console.log(stylePrompt);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe the person or people and their surroundings in the image.",
            },
            {
              type: "image_url",
              image_url: {
                url: base64code,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    console.log("Description made successfully");

    const imageDescription = response.choices[0].message.content;
    console.log("Description:", imageDescription);

    const imgURL = await generateImage(imageDescription, stylePrompt); // Generate an image from the description
    return imgURL;
  } catch (error) {
    if (error.response) {
      console.log("generateImage-Status:", error.response.status);
      console.log("generateImage-Data:", error.response.data);
    } else {
      console.log("generateImage-Error:", error.message);
    }
    exit(1);
  }
}

// Generate art from the description
async function generateImage(description, stylePrompt) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Generate an image with the following description: ${description}. The focus should be on accurately reflecting the art style described as: ${stylePrompt}, while incorporating the key elements of the scene. Prioritize the art style in terms of color, composition, and technique.`,
      n: 1,
      size: "1024x1024",
    });
    console.log("Image generated successfully");

    // Determine file and directory paths
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Save the image locally
    const image_url = response.data[0].url;
    const dateTtile = Date.now();
    const saveDirectory = path.join(__dirname, "images");
    const savePath = path.join(saveDirectory, dateTtile + ".png");

    // Send releative URL to the client
    const URLtoSend = `http://localhost:5353/images/${dateTtile}.png`;

    console.log("Image URL made:", image_url);

    // generate image title
    const imageTitle = await generateImageTitle(image_url);

    const aiOBJ = {
      absoluteURL: image_url,
      relativeURL: URLtoSend,
      title: imageTitle,
    };

    if (!fs.existsSync(saveDirectory)) {
      fs.mkdirSync(saveDirectory);
    }

    downloadImageStream(image_url, savePath)
      .then(() => console.log("Image saved successfully using stream"))
      .catch((err) => console.error("Error downloading image:", err));

    return aiOBJ;
  } catch (error) {
    if (error.response) {
      console.log("generateImage-error-Status:", error.response.status);
      console.log("generateImage-error-Data:", error.response.data);
    } else {
      console.log("generateImage-Error:", error.message);
    }
  }
}

// Generate a title for the image
async function generateImageTitle(img) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Based in the image, generate a title that reflects its mood, theme, or story. The title should be appropriate for an art gallery. Return the title without the use of any punctuation.",
            },
            {
              type: "image_url",
              image_url: {
                url: img,
                detail: "auto",
              },
            },
          ],
        },
      ],
      max_tokens: 100,
    });

    console.log("Image title generated successfully");

    const imageTitle = response.choices[0].message.content;

    return imageTitle;
  } catch (error) {
    if (error.response) {
      console.log("generateImageTitle-Status:", error.response.status);
      console.log("generateImageTitle-Data:", error.response.data);
    } else {
      console.log("generateImageTitle-Error:", error.message);
    }
  }
}
