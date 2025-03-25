import axios from "axios";

export const httpClientPHP = axios.create({
  baseURL: import.meta.env.VITE_PHP_API_URL,
  timeout: 90000, // 60 saniye timeout (isteğe göre artır)
  headers: {
    "Content-Type": "application/json",
    "Accept-Encoding": "gzip"
  }
});
