import mongoose from "mongoose";

const connectDB = async (DATABASE_URL, DATABASE_NAME) => {
  try {
    mongoose.connect(DATABASE_URL + DATABASE_NAME);
    console.log(`Database Connected Successfully...`);
  } catch (error) {
    console.log(`Error while CONNECTING TO DATABASEE`);
  }
};

export default connectDB;
