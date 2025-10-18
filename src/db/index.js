import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

async function ConnectDB(){
  try {
    const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log('MongoDB connected at: ',connectionInstance.connection.host);
  } catch (err) {
      console.log("MONGODB connection error: ",err);
      process.exit(1);
  }
}

export default ConnectDB;