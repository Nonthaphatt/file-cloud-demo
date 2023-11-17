const session = require('express-session');
const MemoryStore = require('memorystore')(session);

const sessionMiddleware = session({
  secret: 'your-secret-key', // Change this to a strong, random key
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore({
    checkPeriod: 86400000, // Prune expired entries every 24 hours
  }),
});

module.exports = sessionMiddleware;