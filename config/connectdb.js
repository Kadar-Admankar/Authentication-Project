import mongoose from "mongoose";

const connectDB = async(DATABASE_URL)=>{
  try {
    const DB_OPTIONS = {
        dbName : `Global_Hospital` 
    }
    await mongoose.connect(DATABASE_URL, DB_OPTIONS)
    console.log(`Connected Successfully...to DB`)
  } catch (error) {
    console.log(error)
  }
}

export default connectDB;