import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed",
    });
  }
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        status: "error",
        message: "Metin alınamadı.",
      });
    }

    const voiceFile = openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    if (!voiceFile) {
      return res
        .status(400)
        .json({ status: "error", message: "TTS API Hatası" });
    }

    const audioArrayBuffer = await (await voiceFile).arrayBuffer();
    if (!audioArrayBuffer) {
      return res
        .status(403)
        .json({ status: "error", message: "Audi Array Bufer is not defined" });
    }
    res.setHeader("Content-Type", "audio/mp3");
    return res.send(Buffer.from(audioArrayBuffer));
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Sunucu Hatası",
    });
  }
}
