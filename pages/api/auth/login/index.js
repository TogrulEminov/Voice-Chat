import { getDataByUnique } from "@/services/servicesOperations";

const handler = async (req, res) => {
  if (!req) {
    return res.status(500).json({ error: "İstek bulunamadı." });
  }
  if (req.method === "GET") {
    try {
      const session = await getServerSession(req, authOptions);

      if (!session) {
        return res.redirect("/login"); // Oturumu olmayan kullanıcıları giriş sayfasına yönlendir
      }

      const user = await getDataByUnique(
        "user",
        { id: session.user.id },
        {
          id: true,
          email: true,
          name: true,
          image: true,
          bio: true,
        }
      );
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "Kullanıcı bulunamadı" });
      }

      return res.status(201).json(user);
    } catch (error) {
      console.error("Kullanıcı verileri alınırken hata:", error);
      return res
        .status(500)
        .json({ status: "error", message: "Sunucu hatası" }, { status: 500 });
    }
  }
};

export default handler;
