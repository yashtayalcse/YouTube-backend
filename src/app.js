import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

cors_options = {
  origin: process.env.CORS_ORIGIN,
  credentials: true
};
app.use(cors(cors_options));
app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true,limit: '16kb'}));
app.use(express.static('public'));
app.use(cookieParser());


export {app};