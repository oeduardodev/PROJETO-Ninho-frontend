export type UserRole = "user" | "professional" | "moderator" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};

export type AuthSession = {
  user: AuthUser;
  tokens: AuthTokens;
};
