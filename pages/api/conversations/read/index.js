import { authOptions } from "@/lib/authOptions";
import { getDataByUniqueMany } from "@/services/servicesOperations";
import { getServerSession } from "next-auth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ status: "error", message: "Method not allowed" });
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res
      .status(401)
      .json({ status: "error", message: "Yetkilendirme başarısız" });
  }

  try {
    const conversations = await getDataByUniqueMany(
      "conversation",
      { userId: session.user.id },
      { createdAt: "asc" }
    );
    if (!conversations) {
      return res
        .status(403)
        .json({ status: "error", message: "Conversation is null" });
    }
    return res.status(201).json(conversations);
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: error.message || "Sunucu Hatası" });
  }
}
