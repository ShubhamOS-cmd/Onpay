import connectDB from "./db/index.js";
import app from "./app.js"
import dotenv from "dotenv";
dotenv.config({
    path : './.env'
})
connectDB()
.then(()=>{ // it's works when db connection succeed
    // connect your app.js
    app.on("error" , (error)=>{ // this is a evenet listner that listens for errro evenst it's for handling general application errors , not database connection errors 
        console.log("Error is founding to connect your app to DB");
        throw error
    })
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("Mongo db connection failed !!! ",err);
})