import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { Account } from "../models/account.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const registerUser = asyncHandler(async (req , res )=>{
    // get user details from req.body
    // validation -> not empty
    // validate phoneNo by OTP in future 
    // check if user is already exists in User
    // check if user have bank account in Account by phoneno 
    // if we need then match acc._id
    // check for image
    // create userObject -> create entry in db
    // upload on them cloudinary
    // remove passpin , refresh token field from response
    // check for user creation
    // return response
    console.log("request of body : ", req.body);
    const { username , email , phoneno , passpin , acc_id} = req.body;
    if([username , email , phoneno , passpin , acc_id].some((field) => field?.trim === "")){
        throw new ApiError(400 , "All field are required!");
    }

    const name = username.toLowerCase().trim();
    const existeduser = await User.findOne({phoneno});
    if(existeduser){
        throw new ApiError(409 , "already user is registerd!");
    }
    const bankAccount = await Account.findOne({phoneno});
    if(!bankAccount){
        throw new ApiError(409 , "Please make a bank account first!");
    }
    if(acc_id !== bankAccount._id){
        throw new ApiError(409 , "please enter valid Account No");
    }
    // check for image of avatar
    console.log("request of file : ",req.file.avatar);
    const avatarLocalPath = req.file?.avatar[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400 , "please send Avatar file , it is required!");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar){
        throw new ApiError(400 , "Avatar file is required");
    }
    const user = await User.create({
        username : name,
        email : email.toLowerCase().trim(),
        phoneno,
        passpin,
        acc_id,
        avatar,
    })
    const createdUser = await User.findById(user._id).select(
        "-passpin -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500 ,"SomeThing went wrong while registration");
    }
    console.log("This is my User : ",createdUser);
    return res.status(201).json(
        new ApiResponse(200 , createdUser , "user is registerd succesfully!")
    )
    
})

export {
    registerUser,
}