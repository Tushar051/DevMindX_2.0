// Chat history model for MongoDB
import { ObjectId } from 'mongodb';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface ChatHistory {
  _id?: ObjectId;
  userId: string | number;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Validation schema for MongoDB
export const chatHistorySchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'messages'],
      properties: {
        userId: {
          bsonType: ['string', 'int'],
          description: 'User ID is required'
        },
        messages: {
          bsonType: 'array',
          description: 'Array of chat messages',
          items: {
            bsonType: 'object',
            required: ['id', 'role', 'content', 'createdAt'],
            properties: {
              id: {
                bsonType: 'string',
                description: 'Unique ID for the message'
              },
              role: {
                enum: ['user', 'assistant'],
                description: 'Role must be either user or assistant'
              },
              content: {
                bsonType: 'string',
                description: 'Message content'
              },
              createdAt: {
                bsonType: 'date',
                description: 'Timestamp when the message was created'
              }
            }
          }
        },
        createdAt: {
          bsonType: 'date',
          description: 'Timestamp when the chat history was created'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Timestamp when the chat history was last updated'
        }
      }
    }
  }
};

// Function to ensure the chatHistory collection exists with proper schema
export async function ensureChatHistoryCollection(db: any) {
  const collections = await db.listCollections({ name: 'chatHistory' }).toArray();
  
  if (collections.length === 0) {
    // Collection doesn't exist, create it with validation
    await db.createCollection('chatHistory', chatHistorySchema);
    
    // Create index on userId for faster queries
    await db.collection('chatHistory').createIndex({ userId: 1 }, { unique: true });
    
    console.log('Chat history collection created with validation schema');
  } else {
    console.log('Chat history collection already exists');
  }
}