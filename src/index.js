import 'dotenv/config'; //keep this at top of the entry file, it populates process.env globally in the project.
import ConnectDB from "./db/index.js";
import { app } from './app.js';

const port = process.env.PORT || 8000;

ConnectDB()
.then(()=>{
  const server = app.listen(port, ()=>{
    console.log(`app running on port: ${port}`);
  })

  server.on('error',(err)=>{
    console.log('error occured in server: ',err);
    process.exit(1);
  })
})
.catch((err)=>{
  console.log('Mongodb connection error from index.js : ',err);
})