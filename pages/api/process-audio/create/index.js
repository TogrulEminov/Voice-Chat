import fs from "fs";
import formidable from "formidable";
import { OpenAI } from "openai";
import path from "path";

// OpenAI client initialization
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "Method Not Allowed" });
  }

  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), "uploads");
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: "erorr", message: err || "Server configuration error" });
  }

  // Configure formidable
  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
  });

  try {
    // Parse the form data
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Ses dosyasının var olup olmadığını kontrol ediyoruz
    const audioFile = files.audio?.[0] || files.audio; // Handle both formidable v3 and v4
    if (!audioFile) {
      return res
        .status(400)
        .json({ status: "error", message: "No audio file provided" });
    }

    // Ses dosyasını okuyoruz
    const audioData = fs.createReadStream(audioFile.filepath);
    if (!audioData) {
      return res
        .status(403)
        .json({ status: "error", message: "Audio data is not defined" });
    }
    try {
      // Transcribe audio using OpenAI
      const transcription = await openai.audio.transcriptions.create({
        file: audioData,
        model: "whisper-1",
        language: "en",
      });
      if (!transcription) {
        return res.status(403).json({
          status: "error",
          message: "Transcription is not defined",
        });
      }
      // Clean up: Delete the temporary file
      try {
        fs.unlinkSync(audioFile.filepath);
      } catch (cleanupError) {
        return cleanupError;
      }

      // Send response
      return res.status(200).json({
        transcribedText: transcription.text,
      });
    } catch (aiError) {
      return res.status(500).json({
        status: "error",
        message: aiError || "Error processing audio with AI",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: error.message || "Error processing audio upload",
    });
  }
}
