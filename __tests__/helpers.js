const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.AUTH_TOKEN_SECRET = 'test-secret-with-more-than-thirty-two-characters';
process.env.CORS_ORIGINS = 'https://catalog.example';

async function startTestApp() {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  const app = require('../app');
  return { app, mongoServer };
}

function createToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.AUTH_TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });
}

async function clearDatabase() {
  await Promise.all(Object.values(mongoose.connection.collections)
    .map((collection) => collection.deleteMany({})));
}

async function stopTestApp(mongoServer) {
  await mongoose.disconnect();
  await mongoServer.stop();
}

module.exports = { clearDatabase, createToken, startTestApp, stopTestApp };