import bcrypt from "bcryptjs";
import { createNewData, getDataByUnique } from "@/services/servicesOperations";

// Kullanıcı kaydı (Register) için POST isteği
export default async function handler(req, res) {
  if (!req) {
    return res
      .status(500)
      .json({ status: "error", message: "Bir hata oluştu!" });
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "Method not allowed" });
  }

  const { email, password, name } = JSON.parse(req.body);

  // Zorunlu alanların kontrolü
  if (!email || !password || !name) {
    return res.status(400).json({
      status: "error",
      message: "Lütfen tüm zorunlu alanları doldurun.",
    });
  }

  try {
    console.log("Kullanıcı kontrol ediliyor...");

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await getDataByUnique("user", { email });

    console.log("existingUser", existingUser);

    // Eğer getDataByUnique fonksiyonu hata dönerse
    if (existingUser) {
      console.error("Veritabanı hatası:", existingUser.message);
      return res
        .status(500)
        .json({ status: "error", message: existingUser.message });
    }
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);
    // Yeni kullanıcı oluştur
    const newUser = await createNewData("user", {
      email,
      name,
      password: hashedPassword,
    });

    if (!newUser) {
      return res
        .status("405")
        .json({ status: "error", message: "User not found" });
    }

    return res.status(201).json({
      status: "success",
      message: "Login successfully,Plese Login now",
      user: newUser,
    });
  } catch (error) {
    // Genel hata
    console.error("Kullanıcı kaydı sırasında hata:", error);
    return res.status(500).json({ status: "error", message: "Sunucu hatası" });
  }
}
