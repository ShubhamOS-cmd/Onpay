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
// if accountUser was to credit money

const depositMoney = asyncHandler(async (req  , res)=>{
    // i take phoneno and amount to deposit money in account because i want to anyone deposit money in bank account 
    // then check if not empty 
    // then validate the amount 
    // then search the account by phone no
    // then account balance update
    // then return the response 
    const {phoneno , amount} = req.body;
    if(!(phoneno && amount)){
        throw new ApiError(400 , "username or amount is required !~");
    }
    if(phoneno.length !== 10){
        throw new ApiError(400 , "please enter Valid phone No!");
    }
    if (typeof amount !== 'number' || amount <= 0 || !Number.isFinite(amount)) {
        throw new ApiError(400, "Enter a valid positive amount!");
    }
    if (amount > 100000) { // Set your max limit
        throw new ApiError(400, "Maximum deposit limit exceeded!");
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const account = await Account.findOne({phoneno});
        if(!account){
            throw new ApiError(404 , "Account not found!");
        }
        const prvBalance = account.Balance;
        account.Balance = Math.round((prvBalance + amount)*100)/100;
        await account.save({session , validateBeforeSave: false});
        await session.commitTransaction();

        return res.status(200).json(
            new ApiResponse(200 , {
                prvBalance,
                depositAmount : amount,
                newBalance: account.Balance
            }, "Money deposit successfully in bank Account!"))
    }
    catch(error){
        await session.abortTransaction();
        throw error;
    }
    finally{
        session.endSession();
    }
})

export {
    registerUser,
    depositMoney,
}