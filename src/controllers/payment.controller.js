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

import { Account } from "../models/account.model.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Transaction } from "../models/transaction.model.js";
import jwt from "jsonwebtoken"
import mongoose, { startSession } from "mongoose";

const paymentThroughPhoneNo = asyncHandler(async(req , res)=>{
    // take data from user 
    // data -> user is login then auth.middleware insert user in req
    // and second data is the phoneNo no of user 2(receiver)
    // and password of bank account 
    // check if the user2 or reciever is valid 
    // if  is valid then 
    // then check password of bank account
    // if it is valid then intiate session ()
    // then do some operation 
    // after all operation be successfull create the transaction model document
    // and insert in db
    const {receiverPhoneNo , password , amount} = req.body;
    // const sender = req.user;
    if (!receiverPhoneNo || !password || !amount) {
        throw new ApiError(400, "All fields are required");
    }
    const sender = await Account.findById(req.user?.acc_id);
    if(!sender){
        throw new ApiError(401 , "Unauthorized request");
    }
    const isPasswordCorrect = await sender.isPasswordCorrect(password);

    if(!isPasswordCorrect){
        throw new ApiError(404 , "Unauthorized request!~");
    }

    if(amount<=0 || amount > 100000 || typeof amount !== 'number'){
        throw new ApiError(400 , "Please enter valid amount of money");
    }

    const minBalnce = 100;
    if(sender.Balance - amount < minBalnce){
        throw new ApiError(401 , "In your Account not enough money!");
    }

    const receiver = await Account.findOne({phoneno:receiverPhoneNo}).select("-password");
    if(!receiver){
        throw new ApiError(404 , "Enter valid receiver phoenNo");
    }
    if (sender._id.toString() === receiver._id.toString()) {
        throw new ApiError(400, "Cannot transfer money to yourself");
    }
    const receiver_User = await User.findOne({phoneno:receiverPhoneNo}).select("-passpin -refreshToken");
    // till now our sender , receiver , amount ,  password is valid 
    // now intaiate session
    const session = await mongoose.startSession();
    try {
        // 
        session.startTransaction();
        sender.Balance = sender.Balance - amount;
        receiver.Balance = receiver.Balance + amount;
        await sender.save({session , validateBeforeSave: false});
        await receiver.save({session , validateBeforeSave:false});

        const transaction = await Transaction.create({
            sender: req.user?._id,
            Amount: amount,
            receiver: receiver_User._id
        })
        return res.status(201).json(
            new ApiResponse(200 , transaction , "Transaction successfully ~")
        )
        // in future when tranaction successfully i sent message to user phoneNo

    } catch (error) {
        await session.abortTransaction();
        console.error("Transaction failed:", error);
        throw new ApiError(500 , "Something went wrong if amount is debited we transfer back in your account ");
    }
    finally{
        await session.endSession();
    }


    
})

const paymentThroughAccountNo = asyncHandler(async(req , res)=>{
    // // take data from user 
    // data -> user is login then auth.middleware insert user in req
    // and second data is the accNo no of user 2(receiver)
    // and password of bank account of user
    // check if the user2 or reciever is valid 
    // if  is valid then 
    // then check password of bank account
    // if it is valid then intiate session ()
    // then do some operation 
    // after all operation be successfull create the transaction model document
    // and insert in db
    const {receiverAcc_No , password , amount} = req.body;
    if (!receiverAcc_No || !password || !amount) {
        throw new ApiError(400, "All fields are required");
    }
    const sender = await Account.findById(req.user?.acc_id);
    if(!sender){
        throw new ApiError(401 , "Unauthorized request");
    }
    const isPasswordCorrect = await sender.isPasswordCorrect(password);

    if(!isPasswordCorrect){
        throw new ApiError(404 , "Unauthorized request!~");
    }

    if(amount<=0 || amount > 100000 || typeof amount !== 'number'){
        throw new ApiError(400 , "Please enter valid amount of money");
    }

    const minBalnce = 100;
    if(sender.Balance - amount < minBalnce){
        throw new ApiError(401 , "In your Account not enough money!");
    }
    const receiver = await Account.findById(receiverAcc_No).select("-password");

    if (sender._id.toString() === receiver._id.toString()) {
        throw new ApiError(400, "Cannot transfer money to yourself");
    }

    const receiver_User = await User.findOne({phoneno : receiver.phoneno}).select("-passpin -refreshToken");

    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        sender.Balance = sender.Balance - amount;
        receiver.Balance = receiver.Balance + amount;
        await sender.save({session , validateBeforeSave: false});
        await receiver.save({session , validateBeforeSave:false});
        const tranaction = await Transaction.create({
            sender : req.user?._id,
            Amount : amount,
            receiver : receiver_User._id
        })
        return res.status(200).json(new ApiResponse(
            200 , tranaction , "Money send successfully"
        ));
    } catch (error) {
        await session.abortTransaction();
        console.error("Transaction failed:", error);
        throw new ApiError(500 , "Something went wrong if amount is debited we transfer back in your account ");
    
    }
    finally{
        await session.endSession();
    }


})
const AccountBalance = asyncHandler(async(req , res)=>{
    // take data from user 
    // data -> user is login then auth.middleware insert user in req
    // and password of bank account 
    // if  is valid then 
    // then check password of bank account
    // then return res
    const {password} = req.body;
    const account = await Account.findById(req.user?.acc_id);
    if(!account){
        throw new ApiError(401 , "Unauthorized request");
    }
    const isPasswordCorrect = await account.isPasswordCorrect(password);

    if(!isPasswordCorrect){
        throw new ApiError(404 , "Unauthorized request!~");
    }
    const Balance = account.Balance;
    return res.status(201).json(
        new ApiResponse(200 , {
            Amount : Balance
        } , "Balance fetch Successfully")
    );
})
export {
    paymentThroughPhoneNo,
    paymentThroughAccountNo,
    AccountBalance,
}