import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path : './.env'
})

connectDB()
.then(()=>{

    app.on("error",(error)=>{
        console.log("Error is founding to connect app to databases!");
        throw error
    })
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Server is running at post : ${process.env.PORT}`);        
    })
})
.catch((error)=>{
    console.log("Connection of app to MongoDB failed!",error);
    
})