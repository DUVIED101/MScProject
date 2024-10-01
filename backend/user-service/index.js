const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { register, login, googleLogin } = require('./authService');
const { Spanner } = require('@google-cloud/spanner');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(bodyParser.json());
app.use(cors());

const spanner = new Spanner({
  projectId: process.env.SPANNER_PROJECT_ID,
});

const instance = spanner.instance(process.env.SPANNER_INSTANCE_ID);
const database = instance.database(process.env.SPANNER_DATABASE_ID);

// Middleware to check JWT
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10); 

    await database.runTransactionAsync(async (transaction) => {
      const query = {
        sql: `INSERT INTO users (id, name, email, password)
              VALUES (@id, @name, @email, @password)`,
        params: {
          id: userId,
          name: name,
          email: email,
          password: hashedPassword,
        },
      };

      await transaction.runUpdate(query);
      await transaction.commit();
    });

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = {
      sql: `SELECT id, name, email, password FROM users WHERE email = @email`,
      params: { email },
    };

    const [rows] = await database.run(query);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const user = rows[0].toJSON();
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generation of a a JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Google login endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { tokenId } = req.body;
    const token = await googleLogin(tokenId);
    res.json({ token });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(400).json({ message: error.message });
  }
});

// User profile endpoint
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const query = {
      sql: `SELECT id, name, email FROM users WHERE id = @id`,
      params: { id: req.user.userId },
    };

    const [rows] = await database.run(query);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(rows[0].toJSON());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Token verification endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json(req.user); 
});

// Start the server
app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});
