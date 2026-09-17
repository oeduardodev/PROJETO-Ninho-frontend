import Constants from "expo-constants";

type ApiEnvelope<T> = {
  data: T;
};

type ApiErrorBody = {
  code?: string;
  message?: string | string[];
};

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
const developmentHost = Constants.expoConfig?.hostUri?.split(":")[0];

export const API_BASE_URL =
  configuredApiUrl ??
  `http://${developmentHost && developmentHost !== "0.0.0.0" ? developmentHost : "localhost"}:3000/api/v1`;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init.headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique se o backend está ligado.",
      0,
      "NETWORK_ERROR",
    );
  }

  const rawBody = await response.text();
  const body = rawBody ? safelyParseJson(rawBody) : undefined;

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | undefined;
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(". ")
      : errorBody?.message;

    throw new ApiError(
      message || "Não foi possível concluir a solicitação.",
      response.status,
      errorBody?.code,
    );
  }

  return (body as ApiEnvelope<T> | undefined)?.data ?? (body as T);
}

function safelyParseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}
