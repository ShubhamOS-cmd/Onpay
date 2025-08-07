import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit:"16kb"}))// this is use for to make limit of requesting data to 16kb

app.use(express.urlencoded({extended:true , limit : "16kb"})); // this is use for url encoded like if wes search fly plane then some url make this fly+plane or some make like fly%20plane

app.use(express.static("public"));

app.use(cookieParser())

import bankRouter from "./routes/bank.routes.js";
app.use("/api/v1/bank" , bankRouter);

export default app