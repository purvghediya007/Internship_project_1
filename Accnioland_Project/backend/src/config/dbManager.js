const mongoose = require("mongoose");

const connections = {};

const BASE_URI = "mongodb+srv://purvghediya007_db_user:vSBABaIz4cz6sCRC@cluster1.axzk2ty.mongodb.net";

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
