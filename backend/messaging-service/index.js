const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { Spanner } = require('@google-cloud/spanner');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const spanner = new Spanner({
  projectId: process.env.SPANNER_PROJECT_ID,
});

const instance = spanner.instance(process.env.SPANNER_INSTANCE_ID);
const database = instance.database(process.env.SPANNER_DATABASE_ID);
const usersDatabase = instance.database(process.env.SPANNER_USERS_DATABASE_ID);

// Middleware for JWT authentication
async function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const bearerToken = token.split(' ')[1];
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// POST: Create a conversation
app.post('/api/conversations', authenticateToken, async (req, res) => {
  try {
    const conversationID = uuidv4();
    const { opportunityID, applicantID } = req.body;
    const creatorID = req.user.userId;
    const lastMessageTimestamp = new Date().toISOString();
    if (!opportunityID || !creatorID || !applicantID) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    console.log('Creating conversation with data:', {
      conversationID,
      opportunityID,
      creatorID,
      applicantID,
      lastMessageTimestamp,
    });

    await database.runTransactionAsync(async (transaction) => {
      const query = {
        sql: `INSERT INTO Conversations (ConversationID, OpportunityID, CreatorID, ApplicantID, LastMessageTimestamp)
              VALUES (@conversationID, @opportunityID, @creatorID, @applicantID, @lastMessageTimestamp)`,
        params: {
          conversationID,
          opportunityID,
          creatorID,
          applicantID,
          lastMessageTimestamp,
        },
      };

      await transaction.runUpdate(query);
      await transaction.commit();
      res.status(200).json({ message: 'Conversation created successfully!', conversationID });
    });
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


 // GET: Fetch all conversations for the logged-in user
app.get('/api/conversations', authenticateToken, async (req, res) => {
    try {
        const userID = req.user.userId; 
        const [rows] = await database.run({
            sql: `
                SELECT * 
                FROM Conversations 
                WHERE CreatorID = @userID OR ApplicantID = @userID
            `,
            params: {
                userID,
            },
        });

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No conversations found' });
        }
        res.status(200).json(rows.map(row => row.toJSON()));
    } catch (err) {
        console.error('Error fetching conversations:', err);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
});

// GET: Retrieve messages for a specific conversation and fetch sender names from the Users database
app.get('/api/conversations/:conversationID/messages', authenticateToken, async (req, res) => {
    const conversationID = req.params.conversationID;
    const token = req.headers['authorization'];
  
    try {
      const query = {
        sql: `SELECT * FROM Messages WHERE ConversationID = @conversationID ORDER BY Timestamp ASC`,
        params: { conversationID },
      };
      const [rows] = await database.run(query); 
      if (rows.length === 0) {
        return res.status(404).json({ message: 'No messages found for this conversation' });
      }

      const messagesWithSenderNames = await Promise.all(rows.map(async (message) => {
        const senderID = message.SenderID;
        try {
          const userQuery = {
            sql: `SELECT name FROM users WHERE id = @senderID`,
            params: { senderID },
          };
          const [userRows] = await usersDatabase.run(userQuery);
          const senderName = userRows.length > 0 ? userRows[0].name : 'Unknown';
  
          return {
            ...message.toJSON(),
            SenderName: senderName,
          };
        } catch (err) {
          console.error(`Failed to fetch user data for senderID: ${senderID}`, err);
          return { ...message.toJSON(), SenderName: 'Unknown' };
        }
      }));
  
      res.json(messagesWithSenderNames);
    } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });
  
  // POST: Send a message in a conversation
  app.post('/api/conversations/:conversationID/messages', authenticateToken, async (req, res) => {
    const conversationID = req.params.conversationID;
    const { senderID, messageContent } = req.body;
    const messageID = uuidv4();
    const timestamp = new Date().toISOString();

    if (!senderID || !messageContent) {
      return res.status(400).json({ message: 'Sender and message content are required' });
    }
  
    try {
      await database.runTransactionAsync(async (transaction) => {
        const query = {
          sql: `INSERT INTO Messages (MessageID, ConversationID, SenderID, MessageContent, Timestamp)
                VALUES (@messageID, @conversationID, @senderID, @messageContent, @timestamp)`,
          params: {
            messageID,
            conversationID,
            senderID,
            messageContent,
            timestamp,
          },
        };
  
        await transaction.runUpdate(query);
        await transaction.commit();
        res.status(200).json({ message: 'Message sent successfully!', messageID });
      });
    } catch (err) {
      console.error('Error sending message:', err);
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

// Start the messaging service
const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Messaging service is running on port ${PORT}`);
});
