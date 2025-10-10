import { ForgotPasswordRequestSchema, LoginRequestSchema, LoginResponseSchema, type ForgotPasswordRequest, type LoginRequest, type LoginResponse } from "../validation/auth";
import { http } from "./http";
export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const req = LoginRequestSchema.parse(payload);
    const { data } = await http.post("/auth/login", req);
    const parsed = LoginResponseSchema.parse(data);
    localStorage.setItem("token", parsed.token);
    return parsed;
  },
  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    const req = ForgotPasswordRequestSchema.parse(payload);
    await http.post("/auth/forgot-password", req);
  },
};
