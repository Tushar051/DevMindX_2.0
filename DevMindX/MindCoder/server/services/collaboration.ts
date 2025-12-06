import { nanoid } from 'nanoid';

export interface CollaborationInvite {
  code: string;
  sessionId: string;
  createdBy: string;
  expiresAt: Date;
}

// In-memory storage for invites (replace with Redis/DB for production)
const invites = new Map<string, CollaborationInvite>();

export class CollaborationService {
  /**
   * Generate a unique invite code for a session
   */
  static generateInviteCode(sessionId: string, userId: string): string {
    const code = nanoid(8).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    invites.set(code, {
      code,
      sessionId,
      createdBy: userId,
      expiresAt
    });

    return code;
  }

  /**
   * Get session ID from invite code
   */
  static getSessionFromInvite(code: string): string | null {
    const invite = invites.get(code);
    
    if (!invite) {
      return null;
    }

    // Check if expired
    if (new Date() > invite.expiresAt) {
      invites.delete(code);
      return null;
    }

    return invite.sessionId;
  }

  /**
   * Revoke an invite code
   */
  static revokeInvite(code: string): boolean {
    return invites.delete(code);
  }

  /**
   * Clean up expired invites
   */
  static cleanupExpiredInvites(): void {
    const now = new Date();
    for (const [code, invite] of invites.entries()) {
      if (now > invite.expiresAt) {
        invites.delete(code);
      }
    }
  }

  /**
   * Generate a unique session ID
   */
  static generateSessionId(): string {
    return nanoid(16);
  }
}

// Cleanup expired invites every hour
setInterval(() => {
  CollaborationService.cleanupExpiredInvites();
}, 60 * 60 * 1000);
