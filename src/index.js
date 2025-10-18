import 'dotenv/config'; //keep this at top of the entry file, it populates process.env globally in the project.
import ConnectDB from "./db/index.js";

ConnectDB();