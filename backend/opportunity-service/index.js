const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Spanner } = require('@google-cloud/spanner');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const multer = require('multer'); 
const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const spanner = new Spanner({
  projectId: process.env.SPANNER_PROJECT_ID,
});

const instance = spanner.instance(process.env.SPANNER_INSTANCE_ID);
const database = instance.database(process.env.SPANNER_DATABASE_ID);

const storage = new Storage();
const bucket = storage.bucket(process.env.BUCKET_NAME);

const upload = multer({ //creating file storage
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, 
});

// Middleware to check JWT
async function authenticateToken(request, response, next) {
  const token = request.headers['authorization'];
  if (!token) {
    return response.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/auth/verify`, {
      headers: {
        Authorization: token,
      },
    });
    request.user = response.data; 
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    response.status(403).json({ message: 'Invalid or expired token' });
  }
}

// POST: Create an Opportunity
app.post('/api/opportunities', authenticateToken, async (request, response) => {
  const { title, description, location, deadline, educationLevel, subjectFilters } = request.body;
  const opportunityID = uuidv4();

  if (!title || !description || !deadline) {
    return response.status(400).json({ message: 'Title, description, and deadline are required' });
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
          postedBy: request.user.userId, 
          educationLevel,
          subjectFilters,
        },
      };

      const rowCount = await transaction.runUpdate(query);
      await transaction.commit();
      response.status(200).json({ message: 'Opportunity posted successfully!', opportunityID });
    });
  } catch (err) {
    console.error('Transaction ERROR:', err);
    response.status(500).json({ error: 'Failed to post opportunity' });
  }
});

// GET: Get all opportunities posted by a specific user
app.get('/api/opportunities', authenticateToken, async (request, response) => {
  try {
    const query = {
      sql: `SELECT * FROM Opportunities WHERE PostedBy = @postedBy`,
      params: { postedBy: request.user.userId },
    };

    const [rows] = await database.run(query);
    response.json(rows.map(row => row.toJSON()));
  } catch (error) {
    console.error('Fetch ERROR:', error);
    response.status(500).json({ message: 'Failed to fetch opportunities' });
  }
});

// GET: Get a specific opportunity
app.get('/api/opportunities/:id', authenticateToken, async (req, res) => {
  const opportunityID = req.params.id;
  try {
    const query = {
      sql: `SELECT * FROM Opportunities WHERE OpportunityID = @opportunityID`,
      params: { opportunityID },
    };

    const [rows] = await database.run(query);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
//showing opportunity to every user
    res.json(rows[0].toJSON());
  } catch (error) {
    console.error('Fetch ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch opportunity details' });
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
app.post('/api/opportunities/:id/apply', authenticateToken, upload.single('cv'), async (req, res) => {
  const { motivationLetter } = req.body;
  const opportunityID = req.params.id;
  const applicationID = uuidv4();
  let cvUrl = null;

  if (!motivationLetter) {
    return res.status(400).json({ message: 'Motivation letter is required' });
  }

  // If a CV is uploaded, upload it to GCS
  if (req.file) {
    try {
      const blob = bucket.file(`cvs/${applicationID}-${req.file.originalname}`);
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      blobStream.on('error', (err) => {
        console.error('Error uploading file to GCS:', err);
        res.status(500).json({ message: 'Failed to upload CV' });
      });

      blobStream.on('finish', () => {
        cvUrl = `https://storage.cloud.google.com/${bucket.name}/${blob.name}`;
        console.log('File uploaded to GCS:', cvUrl);
        submitApplication();
      });

      blobStream.end(req.file.buffer); // Uploadign the file buffer to GCS
    } catch (err) {
      console.error('Error handling file upload:', err);
      return res.status(500).json({ message: 'Failed to process CV upload' });
    }
  } else {
    submitApplication(); // No file uploaded, proceed to application submission
  }

  // Function to handle application submission
  async function submitApplication() {
    try {
      await database.runTransactionAsync(async (transaction) => {
        const query = {
          sql: `INSERT INTO Applications (ApplicationID, OpportunityID, UserID, ApplicationDate, MotivationLetter, CVUrl)
                VALUES (@applicationID, @opportunityID, @userID, PENDING_COMMIT_TIMESTAMP(), @motivationLetter, @cvUrl)`,
          params: {
            applicationID,
            opportunityID,
            userID: req.user.userId,
            motivationLetter,
            cvUrl,
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
  }
});

// GET: Get all applications for a user
app.get('/api/my-applications', authenticateToken, async (req, res) => {
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

// GET: Get all applications for an opportunity
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