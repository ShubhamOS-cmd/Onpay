import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Account} from "../models/account.model.js";
import { Account } from "../models/account.model.js";
import mongoose from "mongoose";

const registerAccount = asyncHandler(async(req , res) => {
    // get Account register details from frontend 
    // validation -> not empty
    // check if already exists : phone no 
    // create account object -> create entry in db
    // while sending response remove password and if any credeintails information
    // check for user creation 
    // return reponse

    // now code
    const {name , phoneno , email , pincode , Balance , password} = req.body;
    // for validation 
    if([name , phoneno , email , pincode , Balance , password].some((field) => field?.trim() === "")){
        throw new ApiError(400 , "All fields are required !");
    }
    const mobno = phoneno;
    const existedAccount = await Account.findOne({
        mobno
    })

    if(existedAccount){
        throw new ApiError(409,"already user registered with this mob no!");
    }

    const account = await Account.create({
        name: name.toLowercase(),
        phoneno,
        email,
        mobno,
        password,
        Balance,
        pincode
    });
    const createdAccount = await Account.findOne(account._id).select("-password")
    if(!createdAccount){
        throw new ApiError(500 , "Something went wrong while regestration!!");
    }
    console.log("This is my user account!: " , account);

    return res.status(201)
    .json(new ApiResponse(
        200 , createdAccount , "Account  regesrtration successfully!"
    ));
});

export {
    registerAccount,
}