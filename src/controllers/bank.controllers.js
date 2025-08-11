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

const fetchBalance = asyncHandler(async(req,res)=>{
    // take phoneno , password 
    // validate 
    // search in the databases 
    // when account find match the password
    // return res
    const {phoneno , password} = req.body;
    if(!phoneno || !password){
        throw new ApiError(400 , "Please enter all required details");
    }
    if(phoneno.length !== 10){
        throw new ApiError(400 , "please enter Valid phone No!");
    }
    const account = await Account.findOne({phoneno});
    if(!account){
        throw new ApiError(400 , "Please enter valid phoneno");
    }
    const isCorrectPassword = await account.isPasswordCorrect(password);
    if(!isCorrectPassword){
        throw new ApiError(400 , "Invalid Password!");
    }
    return res.status(200).json(
        new ApiResponse(200 , {
            AccountNo : account._id,
            phoneno,
            AccountBalnac: account.Balance
        },"Account Balance fetch Successfully")
    );
})
const debitMoney = asyncHandler(async (req,res)=>{
    // take accNo , phoneNo , password , amount
    // validate amount , phoneno
    // then check accNo is match with phoneNo link accNo
    // then validate amount by check it's exceed not
    // then  check password 
    // then balance = balance - amount
    // return res
    const {accNo , phoneno , password , amount} = req.body;
    if(!accNo || !phoneno || !password || !amount){
        throw new ApiError(400 , "All fields are required!");
    }
    if(phoneno.length !== 10){
        throw new ApiError(400 , "Eneter valid phone no!");
    }
    if (typeof amount !== 'number' || amount <= 0 || amount > 100000) {
        throw new ApiError(400, "Please enter valid amount between 1 and 100,000");
    }

    const account = await Account.findOne({phoneno});
    
    if(!account){
        throw new ApiError(400 , "Your Account not find by your phone No");
    }
    if(accNo !== account._id.toString()){
        throw new ApiError(401 , "Your Account No is inavlid according to Your phoneNo!");
    }
    const minBalnce = 100;
    if(account.Balance - amount < minBalnce){
        throw new ApiError(401 , "In your Account not sufficient Balance to debit");
    }
    const isPasswordCorrect = await account.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(401 , "Enter valid password!");
    }
    const session = await mongoose.startSession();
    try {
        await session.startTransaction();
        account.Balance = account.Balance - amount;
        await account.save({session , validateBeforeSave:false});
        await session.commitTransaction();

        return res.status(200).json(
            new ApiResponse(200, {
                debitedamount : amount,
                newBalance : account.Balance 
            },"Amount debited succesfully!")
        );
    } catch (error) {
            await session.abortTransaction();
            throw new ApiError(500 , "Something went wrong while debit money!");
    }
    finally{
        await session.endSession();
    }
})
const sendMoney = asyncHandler(async(req , res)=>{
    // take senderPhoneNo, receiverPhoneNo , senderPassword , sender Amount , 
    // validate amount phonenos , 
    // validate amount by check balance of sender account
    // then check password
    // senderaccount.balance = balance - amount
    // receiveraccount.balance = balance + amount
    // return res
    const { senderPhoneNo , receiverPhoneNo , senderPassword , amount} = req.body;
    if(!senderPhoneNo || !receiverPhoneNo || !senderPassword || !amount){
        throw new ApiError(400 , "All fields are required!");
    }
    if(senderPhoneNo.length!==10){
        throw new ApiError(400 , "Enter valid sender PhoneNo");
    }
    if(receiverPhoneNo.length!==10){
        throw new ApiError(400 , "Enter valid reciever PhoneNo");
    }
    if (senderPhoneNo === receiverPhoneNo) {
    throw new ApiError(400, "Cannot send money to yourself");
    }
    if (typeof amount !== 'number' || amount <= 0 || amount > 100000) {
        throw new ApiError(400, "Please enter valid amount between 1 and 100,000");
    }

    const senderaccount = await Account.findOne({phoneno: senderPhoneNo});
    const receiveraccount = await Account.findOne({phoneno: receiverPhoneNo});
    if(!senderaccount){
        throw new ApiError(404 , "Your account Not existed please try valid phoneNo");
    }
    if(!receiveraccount){
        throw new ApiError(404 , "receiver Account not existed");
    }

    const minBalnce = 100;
    if(senderaccount.Balance - amount < minBalnce){
        throw new ApiError(401 , "In your Account not sufficient Balance to send");
    }

    const isPasswordCorrect = await senderaccount.isPasswordCorrect(senderPassword);
    if(!isPasswordCorrect){
        throw new ApiError(401 ,"Please enter Valid Password!");
    }

    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        senderaccount.Balance = senderaccount.Balance - amount;
        receiveraccount.Balance = receiveraccount.Balance + amount;
        await senderaccount.save({session , validateBeforeSave: false});
        await receiveraccount.save({session , validateBeforeSave: false});
        await session.commitTransaction();

        return res.status(200).json(
            new ApiResponse(200 , {
                MoneyTransfer: amount,
                MoneySendTo: receiveraccount.name,
                MoneySendBy : senderaccount.name,
                MoneyLeftInAccount : senderaccount.Balance,
            },"Money Send Successfully!")
        )
    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(500 , "SomeThing went Wrong while sending Money!");
    }
    finally{
        await session.endSession();
    }

})
const updateAccount = asyncHandler(async(req , res)=>{
    // take phoneNo , password , name 
    // validate phoneno
    // check password 
    // update and send response
    const { phoneno , password , name } = req.body;
    if(!phoneno || !password || !name){
        throw new ApiError(400 , "all feilds required");
    }
    if(phoneno.length !== 10){
        throw new ApiError(400 , "Please enetr valid phoneNo");
    }
    const account = await Account.findOne({phoneno});
    if(!account){
        throw new ApiError(400 , "Please Enter valid PhoneNo your account not be found ");
    }
    if(account.name === name.toLowerCase().trim()){
        throw new ApiError(400 , "Please Enter another name if you want to change");
    }
    const isPasswordCorrect = await account.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(401 , "password is wrong !");
    }
    account.name = name.toLowerCase().trim();
    await account.save({validateBeforeSave: false});
    return res.status(200).json(
        new ApiResponse(200 , {} , "New name is updateSuccesfully")
    )
})

const changePassword = asyncHandler(async(req , res)=>{
    // take phone no , new and old password 
    // validate 
    // update and save
    const {phoneno , oldpassword , newPassword} = req.body;
    if(!phoneno || !oldpassword || !newPassword){
        throw new ApiError(400 , "All fields are required");
    }
    if(phoneno.length!==10){
        throw new ApiError(400 , "please enter valid phoneNo");
    }
    if(oldpassword === newPassword){
        throw new ApiError(401 , "Please Enter another password if you want to change");
    }
    const account = await Account.findOne({phoneno});
    if(!account){
        throw new ApiError(400 , "Please Enter valid PhoneNo your account not be found ");
    }
    const isPasswordCorrect = await account.isPasswordCorrect(oldpassword);
    if(!isPasswordCorrect){
        throw new ApiError(404 , "your password is wrong");
    }
    account.password = newPassword;
    await account.save({validateBeforeSave:false});

    return res.status(200).json(
        new ApiResponse(200 , {} , "Your password is change succesully!")
    )
})
const changePhoneNO = asyncHandler(async(req , res)=>{
    // take phoneNo , password , new phoneNo
    // validate
    // check if newPhoneNo is already registers 
    // then update and send reponse
    const {phoneno , password , newPhoneno} = req.body;
    if(!phoneno || !password || !newPhoneno){
        throw new ApiError(400 , "all fields are required");
    }
    if(phoneno.length!==10){
        throw new ApiError(400 , "please enter valid phoneNo");
    }
    if(newPhoneno.length !== 10){
        throw new ApiError(400 , "please enter valid new phoneNo");
    }
    const existedAccount = await Account.findOne({phoneno:newPhoneno}).select("-password");
    if(existedAccount){
        throw new ApiError(404 ,"newPhone is already registered");
    }
    const account = await Account.findOne({phoneno});
    if(!account){
        throw new ApiError(401 , "account is not found");
    }
    account.phoneno = newPhoneno;
    await account.save({validateBeforeSave:false});
    return res.status(200).json(
        new ApiResponse(200 , {} , "phoneNo is chnaged successfull!")
    )
})
export {
    registerUser,
    depositMoney,
    fetchBalance,
    debitMoney,
    sendMoney,
    updateAccount,
    changePassword,
    changePhoneNO,
}