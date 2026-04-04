import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

export type CollabUser = {
  id: string;
  username: string;
  color: string;
  cursor?: { line: number; column: number; file: string };
};

type Options = {
  sessionId: string | null;
  userId: string | number | undefined;
  enabled: boolean;
  setFiles: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  /** Session whiteboard JSON from server / peers */
  onWhiteboardData?: (json: string) => void;
};

function socketOrigin(): string {
  const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");
  return base || window.location.origin;
}

/**
 * Socket.IO collaboration: join-session, code-change, file-tree-update.
 * Matches server/realtime/socket.ts events.
 */
export function useIdeCollaboration({
  sessionId,
  userId,
  enabled,
  setFiles,
  onWhiteboardData,
}: Options) {
  const socketRef = useRef<Socket | null>(null);
  const whiteboardCbRef = useRef(onWhiteboardData);
  whiteboardCbRef.current = onWhiteboardData;
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<CollabUser[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!enabled || !sessionId) {
      setConnected(false);
      setUsers([]);
      return;
    }

    const token = localStorage.getItem("devmindx_token");
    if (!token) {
      setConnected(false);
      return;
    }

    const socket = io(socketOrigin(), {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      socket.emit("join-session", sessionId);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", () => setConnected(false));

    socket.on(
      "session-state",
      (data: { users?: CollabUser[]; files?: Record<string, string>; whiteboardData?: string }) => {
        if (data.users) setUsers(data.users);
        if (data.files && Object.keys(data.files).length > 0) {
          setFiles((prev) => ({ ...prev, ...data.files }));
        }
        if (typeof data.whiteboardData === "string") {
          whiteboardCbRef.current?.(data.whiteboardData);
        }
      },
    );

    socket.on("user-joined", (data: { user: CollabUser }) => {
      setUsers((u) => {
        const rest = u.filter((x) => x.id !== data.user.id);
        return [...rest, data.user];
      });
    });

    socket.on("user-left", (data: { userId: string }) => {
      setUsers((u) => u.filter((x) => x.id !== data.userId));
    });

    socket.on(
      "code-update",
      (data: { userId: string; file: string; content: string }) => {
        if (String(data.userId) === String(userId)) return;
        setFiles((prev) => ({ ...prev, [data.file]: data.content }));
      },
    );

    socket.on(
      "file-tree-update",
      (data: {
        userId: string;
        action: string;
        node?: { path?: string; type?: string };
      }) => {
        if (String(data.userId) === String(userId)) return;
        if (data.action === "create" && data.node?.path) {
          const p = data.node.path;
          setFiles((prev) => (p in prev ? prev : { ...prev, [p]: "" }));
        }
      },
    );

    socket.on(
      "whiteboard-update",
      (data: { userId: string; data: string }) => {
        if (String(data.userId) === String(userId)) return;
        if (typeof data.data === "string") whiteboardCbRef.current?.(data.data);
      },
    );

    if (socket.connected) onConnect();

    return () => {
      window.clearTimeout(debounceRef.current);
      socket.emit("leave-session");
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      setUsers([]);
    };
  }, [enabled, sessionId, userId, setFiles]);

  const scheduleCodeSync = useCallback((file: string, content: string) => {
    const s = socketRef.current;
    if (!s?.connected) return;
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      s.emit("code-change", { file, content, changes: null });
    }, 450);
  }, []);

  const broadcastFileCreate = useCallback((path: string, content = "") => {
    const s = socketRef.current;
    if (!s?.connected) return;
    s.emit("file-tree-update", {
      action: "create",
      node: { path, type: "file" },
    });
    s.emit("code-change", { file: path, content, changes: null });
  }, []);

  const emitFileOpen = useCallback((file: string) => {
    socketRef.current?.emit("file-open", { file });
  }, []);

  const emitWhiteboardUpdate = useCallback((data: string) => {
    socketRef.current?.emit("whiteboard-update", { data });
  }, []);

  return {
    connected,
    users,
    panelOpen,
    setPanelOpen,
    scheduleCodeSync,
    broadcastFileCreate,
    emitFileOpen,
    emitWhiteboardUpdate,
    socketRef,
  };
}
