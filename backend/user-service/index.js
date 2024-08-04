const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Spanner } = require('@google-cloud/spanner');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(bodyParser.json());
app.use(cors());

// Configure Spanner
const spanner = new Spanner({
  projectId: 'custom-mile-430418-b9',
  keyFilename: path.join(__dirname, 'custom-mile-430418-b9-c99dd8d1f1d5.json'),
});

const instance = spanner.instance('user-instance');
const database = instance.database('user-db');

app.get('/users', async (req, res) => {
  try {
    const query = {
      sql: 'SELECT * FROM Users',
    };
    const [rows] = await database.run(query);
    res.json(rows);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});