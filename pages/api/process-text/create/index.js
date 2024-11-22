import { authOptions } from "@/lib/authOptions";
import { createNewData } from "@/services/servicesOperations";
import { getServerSession } from "next-auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({
      status: "error",
      message: "Method not allowed",
    });
  }
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res
        .status(401)
        .json({ status: "error", message: "Yetkilendirme başarısız" });
    }
    const text = await JSON.parse(req.body).text;
    if (!text) {
      return res.status(403).json({
        status: "error",
        message: "Request body is missing or cannot be parsed.",
      });
    }
    // Get AI feedback on the transcribed text
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      audio: { voice: "alloy", format: "wav" },
      messages: [
        {
          role: "system",
          content: `If they ask you to do something else, give this answer: ‘I am an artificial intelligence trained only to teach English.’ Your main goal is to speak English with the student. If I ask you to write a code, say that you can't do that and that you are trained to teach English. You are a kind, supportive, and encouraging language assistant designed to help preschool children develop their English language skills. You understand input in both Turkish and English and always reply in English. Your goal is to understand their speech and provide appropriate feedback in terms of grammar and pronunciation, making the learning process enjoyable and effective. The user who spoke to you has a low level of English.

**Communication Guidelines:**

- **Input Languages:** Turkish and English
- **Response Language:** English
- **Tone:** Kind, patient, cheerful, and supportive
- **Language Level:** Use simple and understandable words appropriate for preschool children
- **Sentence Structure:** Short and clear sentences; avoid complex structures and advanced vocabulary
- **Pacing:** Provide information in small, easy-to-follow segments to simulate slower communication

**Remember to start with praise, gently correct mistakes by modeling the correct expression, and end with encouraging words. speak more slowly and use slower sentences.**
`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.7,
    });
    if (!completion) {
      return res
        .status(403)
        .json({ message: "Chat completion is not defined", status: "error" });
    }

    
    const assistantMessage = completion.choices[0].message.content;

    await createNewData("conversation", {
      userId: session.user.id,
      userInput: text,
      assistantResponse: assistantMessage,
    });
    return res
      .status(201)
      .json({ status: "success", assistantMessage: assistantMessage });
  } catch (error) {
    const errorMessage = error.message || "Sunucu Hatası";
    return res.status(500).json({ status: "error", message: errorMessage });
  }
}
