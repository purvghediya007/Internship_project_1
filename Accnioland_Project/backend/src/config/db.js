const mongoose = require("mongoose");
const db="mongodb+srv://purvghediya007_db_user:vSBABaIz4cz6sCRC@cluster1.axzk2ty.mongodb.net/accionland?retryWrites=true&w=majority";
const connectDB = async () => {
  try {
    await mongoose.connect(db);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("DB Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
// import mongoose from 'mongoose'



// const mongoose = require("mongoose");



// const DB = 'mongodb://localhost:27017/ns';

// const connectdb =async ()=>{ mongoose
//   .connect(DB, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then((con) => {
//     console.log(con.connection);
//     console.log('MongoDB connected successfully')

//   })
//   .catch((err) => console.error('MongoDB connection error:', err));

// }



// module.exports = connectdb;
// export default connectdb;
