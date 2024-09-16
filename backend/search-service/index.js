const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Spanner } = require('@google-cloud/spanner');
const jwt = require('jsonwebtoken'); 
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const spanner = new Spanner({
  projectId: process.env.SPANNER_PROJECT_ID,
});

const instance = spanner.instance(process.env.SPANNER_INSTANCE_ID);
const database = instance.database(process.env.SPANNER_DATABASE_ID);

// Middleware to check JWT and authenticate user
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
// Endpoint for getting all opportunities
app.get('/api/opportunities', async (req, res) => {
  try {
    const query = {
      sql: 'SELECT OpportunityID, Title, Description, Deadline FROM Opportunities',
    };
    const [rows] = await database.run(query);

    res.status(200).json(rows.map(row => row.toJSON()));
  } catch (err) {
    console.error('Error retrieving opportunities:', err);
    res.status(500).json({ message: 'Error retrieving opportunities' });
  }
});


// Endpoint for Opportunity searching
app.get('/api/opportunities/search', async (req, res) => {
  const { title, location, educationLevel, subjectFilters } = req.query;

  let sql = `SELECT OpportunityID, Title, Description, Location, Deadline, PostedBy, EducationLevel, SubjectFilters
             FROM Opportunities WHERE 1=1`;

  const params = {};
  
  // Filtering by title
  if (title) {
    sql += ` AND Title LIKE @title`;
    params.title = `%${title}%`;
  }

  // Filtering by location
  if (location) {
    sql += ` AND Location LIKE @location`;
    params.location = `%${location}%`;
  }

  // Filtering by education level
  if (educationLevel) {
    sql += ` AND EducationLevel = @educationLevel`;
    params.educationLevel = educationLevel;
  }

  // Filtering by subject filters (handling array)
  if (subjectFilters) {
    const subjectsArray = subjectFilters.split(',').map(s => s.trim());
    sql += ` AND ARRAY(SELECT subject FROM UNNEST(SubjectFilters)) && @subjectFilters`;
    params.subjectFilters = subjectsArray;
  }

  try {
    const [rows] = await database.run({
      sql,
      params,
    });

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No matching opportunities found' });
    }

    const opportunities = rows.map(row => row.toJSON());
    res.json(opportunities);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Failed to find opportunities' });
  }
});

// Endpoint for Opportunity details
app.get('/api/opportunities/:opportunityID', authenticateToken, async (req, res) => {
  const { opportunityID } = req.params;

  try {
    const query = {
      sql: `SELECT OpportunityID, Title, Description, Location, Deadline, EducationLevel, SubjectFilters, PostedBy
            FROM Opportunities WHERE OpportunityID = @opportunityID`,
      params: {
        opportunityID,
      },
    };

    const [rows] = await database.run(query);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    const opportunity = rows[0].toJSON();
    res.status(200).json(opportunity);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ message: 'Failed to fetch opportunity details' });
  }
});

// Start the server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Search service is running on port ${PORT}`);
});
