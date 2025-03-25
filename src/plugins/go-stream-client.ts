import axios from "axios";

export const goStreamClient = axios.create({
  baseURL: import.meta.env.VITE_GO_STREAM_API,
  timeout: 60000, // 1 dakika timeout
  responseType: "json",
});
