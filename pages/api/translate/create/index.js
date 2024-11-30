import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import OpenAI from "openai";

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export default async function hanlder(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res
      .status(401)
      .json({ status: "error", message: "Yetkilendirme başarısız" });
  }
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "Method not allowed" });
  }

  try {
    const { selection } = req.body;

    if (!selection || selection.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Request body must include a valid 'selection' field.",
      });
    }

    const prompt = `
      Translate the following text to Turkish:
      "${selection}"
      
      Then, provide a list of synonyms for the word "${selection}" in English.
          `;
    const response = await openAi.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: prompt,
      max_tokens: 200,
    });
    if (!response.choices || response.choices.length === 0) {
      throw new Error("Invalid response from OpenAI.");
    }
    const output = response.choices[0].text.trim();
    const parts = output.split("\n\n");
    const translation = parts[0]?.trim() || "Translation not found.";
    const synonyms = parts[1]?.trim() || "Synonyms not found.";
    if (!output) {
      return res
        .status(500)
        .json({ status: "error", message: "result not found, please check!" });
    }

    console.log("translation", translation);
    console.log("syn", synonyms);

    res.status(200).json({
      selection,
      translation,
      synonyms,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred during translation.",
      error: error.message,
    });
  }
}
