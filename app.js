import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

const app=express();

app.use(cors(
  {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }
))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("./public"))
app.use(cookieParser(process.env.COOKIE_SECRET))

// import routers
import userRouter from "./src/routes/user.route.js"
import channelRouter from "./src/routes/channel.route.js"

// routes declaration
app.use("/api/v1/users/", userRouter); // http://localhost:8000/api/v1/users/
app.use("/api/v1/channel/", channelRouter); // http://localhost:8000/api/v1/channels/


export default app;