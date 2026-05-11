import { io, type Socket } from "socket.io-client";

function normalizeBackendUrl(raw?: string) {
  const candidate = (raw ?? "").trim() || "http://localhost:3000";
  return candidate.replace(/\/api\/?$/, "");
}

const WS_BASE_URL = normalizeBackendUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

export function createSocket(accessToken: string): Socket {
  return io(WS_BASE_URL, {
    auth: { token: accessToken },
    transports: ["websocket"],
  });
}
