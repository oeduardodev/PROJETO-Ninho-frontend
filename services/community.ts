import { getStoredSession } from "@/storage/auth-session";
import type { AuthSession } from "@/types/auth";

import { ApiError, apiRequest } from "./api";
import { authService } from "./auth";

export type CommunityAuthor = {
  id: string;
  name: string;
  handle: string;
  avatarEmoji: string;
  avatarBg: string;
};

export type CommunityPost = {
  id: string;
  author: CommunityAuthor;
  tag: string;
  text: string;
  welcomeCount: number;
  commentCount: number;
  welcomedByMe: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CommunityComment = {
  id: string;
  postId: string;
  author: CommunityAuthor;
  text: string;
  createdAt: string;
};

export type CommunityPage<T> = {
  items: T[];
  nextCursor: string | null;
};

export type FeedFilter = "para" | "recentes";

let sessionRenewal: Promise<AuthSession | null> | null = null;

async function communityRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const session = await getStoredSession();
  if (!session) {
    throw new ApiError("Entre na sua conta para acessar a comunidade.", 401);
  }

  try {
    return await apiRequest<T>(path, init, session.tokens.accessToken);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;

    const latest = await getStoredSession();
    if (latest && latest.tokens.accessToken !== session.tokens.accessToken) {
      return apiRequest<T>(path, init, latest.tokens.accessToken);
    }

    sessionRenewal ??= authService.restore().finally(() => {
      sessionRenewal = null;
    });
    const renewed = await sessionRenewal;
    if (!renewed) {
      throw new ApiError("Sua sessão expirou. Entre novamente.", 401);
    }
    return apiRequest<T>(path, init, renewed.tokens.accessToken);
  }
}

export const communityService = {
  listPosts(filter: FeedFilter, cursor?: string): Promise<CommunityPage<CommunityPost>> {
    const query = new URLSearchParams({ filter, limit: "20" });
    if (cursor) query.set("cursor", cursor);
    return communityRequest(`/community/posts?${query.toString()}`);
  },

  createPost(text: string, tag: string): Promise<CommunityPost> {
    return communityRequest("/community/posts", {
      method: "POST",
      body: JSON.stringify({ text, tag }),
    });
  },

  deletePost(postId: string): Promise<void> {
    return communityRequest(`/community/posts/${postId}`, { method: "DELETE" });
  },

  setWelcome(postId: string, welcomed: boolean): Promise<{
    welcomeCount: number;
    welcomedByMe: boolean;
  }> {
    return communityRequest(`/community/posts/${postId}/welcome`, {
      method: welcomed ? "PUT" : "DELETE",
    });
  },

  listComments(
    postId: string,
    cursor?: string,
  ): Promise<CommunityPage<CommunityComment>> {
    const query = new URLSearchParams({ limit: "30" });
    if (cursor) query.set("cursor", cursor);
    return communityRequest(
      `/community/posts/${postId}/comments?${query.toString()}`,
    );
  },

  createComment(postId: string, text: string): Promise<CommunityComment> {
    return communityRequest(`/community/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  },

  deleteComment(postId: string, commentId: string): Promise<void> {
    return communityRequest(
      `/community/posts/${postId}/comments/${commentId}`,
      { method: "DELETE" },
    );
  },
};
