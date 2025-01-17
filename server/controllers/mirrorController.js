import aiArt from "../models/aiArt.js";

// Controller to create a new AI art entry
export const createAiArt = async (req, res) => {
  const { generation_date, url, art_style, art_title } = req.body;

  try {
    // Create a new AI art document using the data from the request body
    const newAiArt = new aiArt({
      generation_date,
      url,
      art_style,
      art_title,
    });

    // Save the new document to the database
    const savedAiArt = await newAiArt.save();
    res.status(201).json(savedAiArt);
  } catch (error) {
    res.status(500).json({ message: "Error saving AI art", error });
  }
};

// Controller to fetch all AI art entries
export const getAllAiArt = async (req, res) => {
  try {
    const aiArtList = await aiArt.find(); // Fetch all documents
    res.status(200).json(aiArtList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching AI art", error });
  }
};

// Controller to fetch only the newest AI art entry
export const getLatestArt = async (req, res) => {
  try {
    const latestArt = await aiArt.findOne().sort({_id:-1}); // Sort documents so only the newest record is returned
    res.status(200).json(latestArt);
  } catch (error) {
    res.status(500).json({ message: "Error fetching AI art", error });
  }
};