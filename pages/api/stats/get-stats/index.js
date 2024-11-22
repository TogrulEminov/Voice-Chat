import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res
      .status(401)
      .json({ status: "error", message: "Yetkilendirme başarısız" });
  }

  try {
    const totalConversations = await prisma.conversation.count({
      where: { userId: session.user.id },
    });

    return res.status(201).json({ status: "success" }, { totalConversations });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: error || "Sunucu hatası" });
  }
}
