import { ObjectId } from 'mongodb';
import { CollaborationParticipant, CollaborationMessage } from '../../shared/types.js';

export interface CollaborationSession {
  _id?: ObjectId;
  sessionId: string;
  createdBy: string;
  createdAt: Date;
  endedAt?: Date;
  participants: CollaborationParticipant[];
}

export interface StoredCollaborationMessage extends CollaborationMessage {
  _id?: ObjectId;
  sessionId: string;
}

export const collaborationSessionSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['sessionId', 'createdBy', 'createdAt', 'participants'],
      properties: {
        sessionId: {
          bsonType: 'string',
          description: 'Unique session ID'
        },
        createdBy: {
          bsonType: 'string',
          description: 'User ID of the creator'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation timestamp'
        },
        endedAt: {
          bsonType: 'date',
          description: 'End timestamp (optional)'
        },
        participants: {
          bsonType: 'array',
          description: 'Array of participants',
          items: {
            bsonType: 'object',
            required: ['userId', 'username', 'joinedAt', 'isOnline'],
            properties: {
              userId: { bsonType: 'string' },
              username: { bsonType: 'string' },
              email: { bsonType: 'string' },
              joinedAt: { bsonType: 'date' },
              isOnline: { bsonType: 'bool' },
              lastActivity: { bsonType: 'date' },
              color: { bsonType: 'string' }
            }
          }
        }
      }
    }
  }
};

export const collaborationMessageSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['sessionId', 'type', 'userId', 'username', 'content', 'timestamp'],
      properties: {
        sessionId: {
          bsonType: 'string',
          description: 'Session ID'
        },
        type: {
          bsonType: 'string',
          description: 'Message type'
        },
        userId: {
          bsonType: 'string',
          description: 'User ID'
        },
        username: {
          bsonType: 'string',
          description: 'Username'
        },
        content: {
          bsonType: 'string',
          description: 'Message content'
        },
        timestamp: {
          bsonType: 'date',
          description: 'Message timestamp'
        }
      }
    }
  }
};

export async function ensureCollaborationCollections(db: any) {
  const sessionColl = await db.listCollections({ name: 'collaborationSessions' }).toArray();
  if (sessionColl.length === 0) {
    await db.createCollection('collaborationSessions', collaborationSessionSchema);
    await db.collection('collaborationSessions').createIndex({ sessionId: 1 }, { unique: true });
    console.log('Collaboration sessions collection created');
  }
  const messageColl = await db.listCollections({ name: 'collaborationMessages' }).toArray();
  if (messageColl.length === 0) {
    await db.createCollection('collaborationMessages', collaborationMessageSchema);
    await db.collection('collaborationMessages').createIndex({ sessionId: 1, timestamp: 1 });
    console.log('Collaboration messages collection created');
  }
}