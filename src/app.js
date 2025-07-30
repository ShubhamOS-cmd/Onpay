import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({extended:true , limit:"16kb"}))

app.use(express.static("public"));

app.use(cookieParser())



// from here we do routing 

import userRouter from "./routes/user.routes.js";
// routes declaration 
// in this section when client request by an url it match the route and then do further
app.use("/api/v1/users" , userRouter);
// and then do whatever 
// but we make another routing this  one for user and another one for bank 

import bankRouter from "./routes/bank.routes.js";
app.use("/api/v1/bank" , bankRouter);

// ex our routing http://localhost:8000/api/v1/users/register
// http://localhost:8000/api/v1/bank/register
export default app