const neo4j = require('neo4j-driver');
require('dotenv').config(); // Load environment variables from .env file

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

module.exports = driver;
