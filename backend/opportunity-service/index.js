const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Spanner } = require('@google-cloud/spanner');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const spanner = new Spanner({
  projectId: process.env.SPANNER_PROJECT_ID,
});

const instance = spanner.instance(process.env.SPANNER_INSTANCE_ID);
const database = instance.database(process.env.SPANNER_DATABASE_ID);

//checking JWT and authenticate user via User Service
async function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  try {
    const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/auth/verify`, {
      headers: {
        Authorization: token,
      },
    });
    req.user = response.data; // Attach user data to the request
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// Post Opportunity Endpoint
app.post('/api/opportunities', authenticateToken, async (req, res) => {
  const { title, description, location, deadline } = req.body;
  const opportunityID = uuidv4();

  try {
    await database.runTransactionAsync(async (transaction) => {
      const query = {
        sql: `INSERT INTO Opportunities (OpportunityID, Title, Description, Location, Deadline, PostedBy)
              VALUES (@opportunityID, @title, @description, @location, @deadline, @postedBy)`,
        params: {
          opportunityID,
          title,
          description,
          location,
          deadline,
          postedBy: req.user.userId,  // Use the authenticated user's ID from User Service
        },
      };

      await transaction.runUpdate(query);
      await transaction.commit();
      res.status(200).json({ message: 'Opportunity posted successfully!' });
    });
  } catch (err) {
    console.error('ERROR:', err);
    res.status(500).json({ error: 'Failed to post opportunity' });
  }
});

// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Opportunity service is running on port ${PORT}`);
});
