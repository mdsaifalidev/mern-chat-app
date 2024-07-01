// src/api/axios.js
import axios from "axios";
import { redirect } from "react-router-dom";
const BASE_URL = "https://mern-chat-app-kwi3.onrender.com";

export default axios.create({
  baseURL: BASE_URL,
});

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axiosInstance.post("/api/v1/users/refresh-token");
        return axiosInstance(originalRequest);
      } catch (err) {
        return redirect("/login");
      }
    }

    return Promise.reject(error);
  }
);

export { axiosInstance };
