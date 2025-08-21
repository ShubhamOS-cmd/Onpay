// here we make our payment all controllers
// we make an another model for paymnet history
// problem is if i made a model
// {
//     user1: "who send money to other",
//     user2: "who receive from user1",
// }

// and when i send user1 their data of payment history it collections of basically data where user1 only send money 
// nut what if any user send money to user1 
// the model which i discuss is about to only send money but what about if user1 is recieve money

// this file is dedicated to only payment related 
// if i want to get history then i do this in usercontroller

import { Account } from "../models/account.model";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const paymentThroughPhoneNo = asyncHandler(async(req , res)=>{

})

const paymentThroughAccountNo = asyncHandler(async(req , res)=>{

})
const AccountBalance = asyncHandler(async(req , res)=>{

})
export {
    paymentThroughPhoneNo,
    paymentThroughAccountNo,
    AccountBalance,
}