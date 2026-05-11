'use client';

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import type { Socket } from "socket.io-client";
import { createSocket } from "@/lib/socket";

type JoinTenantAck =
  | { ok: true; tenantId: string }
  | { ok: false; tenantId?: string; message?: string };

export function useTenantSocket(tenantId: string | null) {
  const { data: session, status } = useSession();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const accessToken = session?.accessToken;

    if (status !== "authenticated" || !accessToken) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    if (!socketRef.current) {
      const socket = createSocket(accessToken);
      socketRef.current = socket;

      socket.on("connect_error", (err) => {
        console.error("socket connect_error", err);
      });

      socket.on("disconnect", (reason) => {
        console.warn("socket disconnected", reason);
      });
    }

    return () => {
      // keep the socket alive across renders; do not disconnect here
    };
  }, [session, status]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !tenantId) return;

    const joinTenant = () => {
      socket.emit("joinTenant", { tenantId }, (ack: JoinTenantAck) => {
        if (ack && "ok" in ack && ack.ok) {
          return;
        }
        console.warn("joinTenant failed", ack);
      });
    };

    socket.on("connect", joinTenant);
    joinTenant();

    return () => {
      socket.off("connect", joinTenant);
    };
  }, [tenantId]);

  return socketRef.current;
}
