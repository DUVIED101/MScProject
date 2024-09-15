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

// Middleware to check JWT and authenticate user via User Service
async function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/auth/verify`, {
      headers: {
        Authorization: token,
      },
    });
    req.user = response.data; 
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// POST: Create an Opportunity
app.post('/api/opportunities', authenticateToken, async (req, res) => {
  const { title, description, location, deadline, educationLevel, subjectFilters } = req.body;
  const opportunityID = uuidv4();

  if (!title || !description || !deadline) {
    return res.status(400).json({ message: 'Title, description, and deadline are required' });
  }

  try {
    await database.runTransactionAsync(async (transaction) => {
      const query = {
        sql: `INSERT INTO Opportunities (OpportunityID, Title, Description, Location, Deadline, PostedBy, EducationLevel, SubjectFilters)
              VALUES (@opportunityID, @title, @description, @location, @deadline, @postedBy, @educationLevel, @subjectFilters)`,
        params: {
          opportunityID,
          title,
          description,
          location,
          deadline,
          postedBy: req.user.userId, 
          educationLevel,
          subjectFilters,
        },
      };

      const rowCount = await transaction.runUpdate(query);
      await transaction.commit();
      res.status(200).json({ message: 'Opportunity posted successfully!', opportunityID });
    });
  } catch (err) {
    console.error('Transaction ERROR:', err);
    res.status(500).json({ error: 'Failed to post opportunity' });
  }
});

// GET: Get all opportunities posted by a specific user
app.get('/api/opportunities', authenticateToken, async (req, res) => {
  try {
    const query = {
      sql: `SELECT * FROM Opportunities WHERE PostedBy = @postedBy`,
      params: { postedBy: req.user.userId },
    };

    const [rows] = await database.run(query);
    res.json(rows.map(row => row.toJSON()));
  } catch (error) {
    console.error('Fetch ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch opportunities' });
  }
});

// GET: Get a specific opportunity
app.get('/api/opportunities/:id', authenticateToken, async (req, res) => {
  const opportunityID = req.params.id;
  try {
    const query = {
      sql: `SELECT * FROM Opportunities WHERE OpportunityID = @opportunityID AND PostedBy = @postedBy`,
      params: { opportunityID, postedBy: req.user.userId },
    };

    const [rows] = await database.run(query);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    res.json(rows[0].toJSON());
  } catch (error) {
    console.error('Fetch ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch opportunity' });
  }
});

// PUT: Update an opportunity
app.put('/api/opportunities/:id', authenticateToken, async (req, res) => {
  const opportunityID = req.params.id;
  const { title, description, location, deadline, educationLevel, subjectFilters } = req.body;

  if (!title || !description || !deadline) {
    return res.status(400).json({ message: 'Title, description, and deadline are required' });
  }

  try {
    await database.runTransactionAsync(async (transaction) => {
      const query = {
        sql: `UPDATE Opportunities 
              SET Title = @title, Description = @description, Location = @location, 
                  Deadline = @deadline, EducationLevel = @educationLevel, SubjectFilters = @subjectFilters
              WHERE OpportunityID = @opportunityID AND PostedBy = @postedBy`,
        params: {
          opportunityID,
          title,
          description,
          location,
          deadline,
          postedBy: req.user.userId,
          educationLevel,
          subjectFilters,
        },
      };

      const rowCount = await transaction.runUpdate(query);
      await transaction.commit();
      res.status(200).json({ message: 'Opportunity updated successfully!' });
    });
  } catch (err) {
    console.error('Transaction ERROR:', err);
    res.status(500).json({ error: 'Failed to update opportunity' });
  }
});

// DELETE: Delete an opportunity
app.delete('/api/opportunities/:id', authenticateToken, async (req, res) => {
  const opportunityID = req.params.id;

  try {
    await database.runTransactionAsync(async (transaction) => {
      const query = {
        sql: `DELETE FROM Opportunities WHERE OpportunityID = @opportunityID AND PostedBy = @postedBy`,
        params: { opportunityID, postedBy: req.user.userId },
      };

      const rowCount = await transaction.runUpdate(query);
      await transaction.commit();
      res.status(200).json({ message: 'Opportunity deleted successfully!' });
    });
  } catch (err) {
    console.error('Transaction ERROR:', err);
    res.status(500).json({ error: 'Failed to delete opportunity' });
  }
});


// POST: Apply for an opportunity
app.post('/api/opportunities/:id/apply', authenticateToken, async (req, res) => {
  const { motivationLetter } = req.body;  // Only expecting the motivation letter
  const opportunityID = req.params.id;
  const applicationID = uuidv4();

  // Ensure the motivation letter is provided
  if (!motivationLetter) {
    return res.status(400).json({ message: 'Motivation letter is required' });
  }

  try {
    await database.runTransactionAsync(async (transaction) => {
      const query = {
        sql: `INSERT INTO Applications (ApplicationID, OpportunityID, UserID, ApplicationDate, MotivationLetter)
              VALUES (@applicationID, @opportunityID, @userID, PENDING_COMMIT_TIMESTAMP(), @motivationLetter)`,
        params: {
          applicationID,
          opportunityID,
          userID: req.user.userId,
          motivationLetter,
        },
      };

      await transaction.runUpdate(query);
      await transaction.commit();
      res.status(200).json({ message: 'Application submitted successfully!', applicationID });
    });
  } catch (err) {
    console.error('Transaction ERROR:', err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// GET: Get all applications for a user
app.get('/api/applications', authenticateToken, async (req, res) => {
  try {
    const query = {
      sql: `SELECT * FROM Applications WHERE UserID = @userID`,
      params: { userID: req.user.userId },
    };

    const [rows] = await database.run(query);
    res.json(rows.map(row => row.toJSON()));
  } catch (error) {
    console.error('Fetch ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// GET: Get all applications for an opportunity (admin view)
app.get('/api/opportunities/:id/applications', authenticateToken, async (req, res) => {
  const opportunityID = req.params.id;

  try {
    const query = {
      sql: `SELECT * FROM Applications WHERE OpportunityID = @opportunityID`,
      params: { opportunityID },
    };

    const [rows] = await database.run(query);
    res.json(rows.map(row => row.toJSON()));
  } catch (error) {
    console.error('Fetch ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch applications for opportunity' });
  }
});

// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Opportunity service is running on port ${PORT}`);
});
