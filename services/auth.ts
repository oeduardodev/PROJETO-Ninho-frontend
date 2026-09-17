import {
  clearStoredSession,
  getStoredSession,
  saveStoredSession,
} from "@/storage/auth-session";
import type { AuthSession, AuthUser } from "@/types/auth";

import { ApiError, apiRequest } from "./api";

export type RegisterInput = {
  email: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export const authService = {
  async register(input: RegisterInput): Promise<AuthSession> {
    const session = await apiRequest<AuthSession>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    await saveStoredSession(session);
    return session;
  },

  async login(input: LoginInput): Promise<AuthSession> {
    const session = await apiRequest<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    await saveStoredSession(session);
    return session;
  },

  async restore(): Promise<AuthSession | null> {
    const session = await getStoredSession();
    if (!session) return null;

    try {
      const user = await apiRequest<AuthUser>(
        "/auth/me",
        undefined,
        session.tokens.accessToken,
      );
      return { ...session, user };
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }

      try {
        const renewedSession = await apiRequest<AuthSession>("/auth/refresh", {
          method: "POST",
          body: JSON.stringify({
            refreshToken: session.tokens.refreshToken,
          }),
        });
        await saveStoredSession(renewedSession);
        return renewedSession;
      } catch {
        await clearStoredSession();
        return null;
      }
    }
  },

  async logout(): Promise<void> {
    const session = await getStoredSession();
    try {
      if (session) {
        await apiRequest<void>(
          "/auth/logout",
          { method: "POST" },
          session.tokens.accessToken,
        );
      }
    } catch {
      // O logout local deve funcionar mesmo se a API estiver indisponível.
    } finally {
      await clearStoredSession();
    }
  },
};
