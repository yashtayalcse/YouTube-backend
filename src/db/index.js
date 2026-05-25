import mongoose from "mongoose";
import express from "express";
import { DB_NAME } from "../../constants.js";

const app=express();


const connectDB = async ()=>{
  try {
    let connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("Connected to database: ", connection.connections[0].host);

    app.on("error",(error)=>{ //register this listener
      console.log("ERROR HAPPENED FROM db/index.js file: ",error);
    })

    app.listen(process.env.PORT,()=>{
      console.log("Server running on port: ",process.env.PORT)
    })

  } catch (error) {
    console.error("ERROR connecting to DB: ",error);
  }
}

export default connectDB;
