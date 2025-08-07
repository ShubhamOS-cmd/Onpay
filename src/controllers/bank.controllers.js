import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Account } from "../models/account.model.js"
import mongoose from "mongoose"

const registerUser = asyncHandler(async (req , res )=> {
    // take data from req.body
    console.log("request by body ~",req.body);
    const {name , phoneno , email , pincode , Balance , password} = req.body;
    //validate the data
    if(
        [name , email , phoneno, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400 , "All fields are required!")
    }
    if(phoneno.length !== 10){
        throw new ApiError(400 , "Enter valid phoneNo!");
    }
    if(pincode.toString().length !== 6){
        throw new ApiError(400 , "Enter valid pincode!");
    }
    if(Balance < 0 || Balance === undefined){
        throw new ApiError(400 , "Enter valid Balance!");
    }
    // check if phone no is already registers 
    const existedUser = await Account.findOne({phoneno});
    //console.log("This is the user which is already registers : ",existedUser.phoneno);
    
    if(existedUser){
        throw new ApiError(409 , "User is already registers by this phoneno");
    }
    const newAccount = await Account.create({
        name: name.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        phoneno,
        pincode,
        Balance,
        password,
    })

    const createdAccount = await Account.findById(newAccount._id).select("-password");
    if(!createdAccount){
        throw new ApiError(500 , "Something went wrong while registration !");
    }
    console.log("This is my new Account : ",newAccount);
    return res.status(201).json(
        new ApiResponse(200 , createdAccount , "user registartion sucessfully!")
    )
})

export {
    registerUser,
}