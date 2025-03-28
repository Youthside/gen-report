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
