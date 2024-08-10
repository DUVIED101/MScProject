const { Spanner } = require('@google-cloud/spanner');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const uuid = require('uuid');
require('dotenv').config();

const spanner = new Spanner({
  projectId: process.env.SPANNER_PROJECT_ID,
});

const instance = spanner.instance(process.env.SPANNER_INSTANCE_ID);
const database = instance.database(process.env.SPANNER_DATABASE_ID);

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function register(name, email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuid.v4();

  const query = {
    sql: `INSERT INTO users (id, name, email, password) VALUES (@id, @name, @Email, @password)`,
    params: {
      id: userId,
      name,
      email,
      password: hashedPassword,
    },
  };

  await database.run(query);
  return userId;
}

async function login(email, password) {
  const query = {
    sql: `SELECT id, password FROM users WHERE email = @Email`,
    params: { email },
  };

  const [rows] = await database.run(query);
  if (rows.length === 0) {
    throw new Error('User not found');
  }

  const user = rows[0].toJSON();
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  return token;
}

async function googleLogin(tokenId) {
  const ticket = await googleClient.verifyIdToken({
    idToken: tokenId,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  const query = {
    sql: `SELECT id FROM users WHERE googleId = @googleId`,
    params: { googleId: payload.sub },
  };

  const [rows] = await database.run(query);
  let userId;
  if (rows.length === 0) {
    userId = uuid.v4();
    const insertQuery = {
      sql: `INSERT INTO users (id, name, email, googleId) VALUES (@id, @name, @Email, @googleId)`,
      params: {
        id: userId,
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
      },
    };
    await database.run(insertQuery);
  } else {
    userId = rows[0].toJSON().id;
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  return token;
}

module.exports = {
  register,
  login,
  googleLogin,
};
