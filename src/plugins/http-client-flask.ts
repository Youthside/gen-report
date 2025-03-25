import axios from "axios";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_PHP_API
});

export {
    httpClient
}