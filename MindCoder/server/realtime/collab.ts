import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyToken } from "../services/auth.js";

type Participant = {
  userId: string;
  username?: string;
  color?: string;
};

type Session = {
  sessionId: string;
  hostUserId: string;
  createdAt: number;
  participants: Map<string, Participant>;
};

const sessions = new Map<string, Session>();

function randomColor(): string {
  const colors = [
    "#EF4444",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

export function createSession(sessionId: string, hostUserId: string, hostUsername?: string): Session {
  let session = sessions.get(sessionId);
  if (!session) {
    session = {
      sessionId,
      hostUserId,
      createdAt: Date.now(),
      participants: new Map<string, Participant>(),
    };
    sessions.set(sessionId, session);
  }

  session.participants.set(hostUserId, {
    userId: hostUserId,
    username: hostUsername,
    color: randomColor(),
  });

  return session;
}

export function setupCollaborationSockets(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token =
        (socket.handshake.auth && (socket.handshake.auth as any).token) ||
        (socket.handshake.query && (socket.handshake.query as any).token);
      if (!token || typeof token !== "string") {
        return next(new Error("Unauthorized: token missing"));
      }
      const payload: any = verifyToken(token);
      (socket.data as any).user = { id: payload.id, username: payload.username };
      return next();
    } catch (err) {
      return next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket.data as any).user as { id: string; username?: string };

    socket.on("collab:join", ({ sessionId }: { sessionId: string }) => {
      if (!sessionId) return;
      let session = sessions.get(sessionId);
      if (!session) {
        session = createSession(sessionId, user.id, user.username);
      }
      session.participants.set(user.id, {
        userId: user.id,
        username: user.username,
        color: session.participants.get(user.id)?.color || randomColor(),
      });

      socket.join(sessionId);

      const roster = Array.from(session.participants.values());
      io.to(sessionId).emit("collab:roster", { participants: roster, hostUserId: session.hostUserId });
    });

    socket.on("collab:message", ({ sessionId, text }: { sessionId: string; text: string }) => {
      if (!sessionId || !text) return;
      const session = sessions.get(sessionId);
      if (!session) return;
      io.to(sessionId).emit("collab:message", {
        userId: user.id,
        username: user.username,
        text,
        timestamp: Date.now(),
      });
    });

    socket.on("disconnect", () => {
      for (const session of sessions.values()) {
        if (session.participants.has(user.id)) {
          session.participants.delete(user.id);
          const roster = Array.from(session.participants.values());
          io.to(session.sessionId).emit("collab:roster", { participants: roster, hostUserId: session.hostUserId });
        }
      }
    });
  });

  return io;
}


