import api from "./client";

export const authApi = {
  sendOtp: (data: any) => api.post("/auth/send-otp", data),
  login: (data: any) => api.post("/auth/login", data),
  register: (data: any) => api.post("/auth/register", data),
  googleLogin: (credential: string) => api.post("/auth/google", { credential }),
  getMe: () => api.get("/auth/me"),
  updateMe: (data: any) => api.put("/auth/me", data),
  getUsers: () => api.get("/auth/users"),
  updateUser: (id: string, data: any) => api.put(`/auth/users/${id}`, data),
};
