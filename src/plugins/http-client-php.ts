import axios from "axios";

const httpClientPHP = axios.create({
  baseURL: import.meta.env.VITE_PHP_API,
  headers: {
    "Accept-Encoding": "gzip", // Gzip destekliyoruz
    Accept: "application/json",
  },
  responseType: "json", // Gzip'lenmiş içerik otomatik olarak çözülecek
});

export { httpClientPHP };

// import axios from "axios";

// export const httpClientPHPPHP = axios.create({
//   baseURL: import.meta.env.VITE_PHP_API_URL,
//   timeout: 90000, // 60 saniye timeout (isteğe göre artır)
//   headers: {
//     "Content-Type": "application/json",
//     "Accept-Encoding": "gzip"
//   }
// });
