const mongoose = require("mongoose");
require('dotenv').config();
const connections = {};

const BASE_URI = process.env.MONGO_URI;

const getConnection = async (buildingName) => {

  const slug = buildingName.toLowerCase().replace(/[^a-z0-9]/g, "");
  // const dbName = `np_${slug}`;
  const dbName = slug;
  if (connections[dbName]) {
    return connections[dbName];
  }

  const connection = await mongoose.createConnection(
    `${BASE_URI}/${dbName}`
  );

  connections[dbName] = connection;

  return connection;
};

module.exports = getConnection;
