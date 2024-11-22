// Öğrenci (kayıt) işlemleri için kullanılan servis
const postAPI = async (
  URL,
  { body = null, method = "POST", headers = {} } = {}
) => {
  try {
    // Base API URL kontrolü
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    if (!baseURL || !URL) {
      throw new Error("API URL yapılandırması eksik!");
    }

    // Fetch isteği
    const response = await fetch(`${baseURL}${URL}`, {
      method,
      headers: {
        "Content-Type": "application/json", // Varsayılan başlık
        ...headers, // Kullanıcı başlıkları
      },
      body: body ? JSON.stringify(body) : null,
      cache: "no-store", // Güncel veri almak için
    });

    // Yanıt kontrolü
    if (!response.ok) {
      const errorData = await response.json().catch(() => null); // JSON yanıt olmayabilir
      throw new Error(
        errorData?.error ||
          `HTTP Hatası: ${response.status} - ${response.statusText}`
      );
    }

    // Yanıt JSON olarak dönüyor
    return await response.json();
  } catch (err) {
    console.error("API Hatası:", err.message);
    throw new Error(`API isteği başarısız: ${err.message}`);
  }
};

export default postAPI;

// Öğrenci (kayıt) işlemleri için kullanılan servis
const getAPI = async (
  URL,
  headers = { "Content-Type": "application/json" }
) => {
  const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL + URL}`, {
    method: "GET",
    headers: headers,
    cache: "no-store",
  })
    .then((res) => {
      if (res.redirected) {
        // bazı yerlerde window'u bulamıyor kontrol et
        //return window.location.href = res.url;
      } else {
        return res.json();
      }
    })
    .catch((err) => console.error(err));

  return data;
};

export { postAPI, getAPI };
