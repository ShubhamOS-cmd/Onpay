import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { Account } from "../models/account.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
const generateAccessAndRefreshToken = async(userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false});

        return {accessToken  , refreshToken};
    }
    catch(error){
        throw new ApiError(500  , "Something went wrong");
    }
}
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
    if([username , email , phoneno , passpin , acc_id ].some((field) => field?.trim === "")){
        throw new ApiError(400 , "All field are required!");
    }
    console.log("This is my type of acc_id : ",typeof(acc_id));
    
    if(!acc_id){
        throw new ApiError(401 ,"Please enter valid account no!");
    }
    if(phoneno.length!==10){
        throw new ApiError(401 , "Please enter valid phoneNo!");
    }
    if(passpin.length!==6){
        throw new ApiError(401 , "Length of 6 pin required!");
    }
    const name = username.toLowerCase().trim();
    const existeduser = await User.findOne({phoneno});
    if(existeduser){
        throw new ApiError(409 , "already user is registerd!");
    }
    const bankAccount = await Account.findById(acc_id);
    if(!bankAccount){
        throw new ApiError(409 , "Please make a bank account first!");
    }
    console.log("bank account no ",bankAccount);
    
    if(bankAccount.phoneno !== phoneno){
        throw new ApiError(409 , "please recheck accountNo and phoneNo ");
    }
    // check for image of avatar
    console.log("request of file : ",req.file);
    const avatarLocalPath = req.file?.path;
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
const loginUser = asyncHandler(async(req,res)=>{
    // take data from req.body 
    // validate 
    // find the user
    // password check
    // if password right then send otp in future
    // acess and refesh token 
    // send cookie
    
    const {phoneno ,  passpin} = req.body;
    if(!phoneno || phoneno.length!==10){
        throw new ApiError(400 , "Enetr valid phoneNo !");
    }
    const user = await User.findOne({phoneno});
    if(!user){
        throw new ApiError(404 , "User not find");
    }
    const isPasswordCorrect = await user.isPasswordCorrect(passpin);
    if(!isPasswordCorrect){
        throw new ApiError(404 , "Please enter valid password");
    }
    const { accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id);

    const LoggedInUser = await User.findById(user._id).select("-passpin -refreshToken");
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.
    status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(200 , {
            user: LoggedInUser , accessToken , refreshToken
        },"User is login succesfully")
    )
})
const logOutUser = asyncHandler(async(req,res)=>{
    // remove cookies
    // reset refrsh token
    // but how to find the user
    // we use middleware our own 
    // we use verifyJWT middleware to inject userin req 
    // now we have acess the user
    // search the user in DB and remove the acess token
    // search the user un db and remove the tokens
    // we make authmiddleware beacuse at many places we need for this 
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("acessToken" , options)
    .clearCookie("refreshToken" ,options)
    .json(new ApiResponse(200 , {} , "user loggedOut successfully!"));

})
// when our  login session expired by access token expire
// we make an refresh acess token
const refreshTokenAccessToken = asyncHandler(async(req,res)=>{
    // we need refrsh token to made a new 
    // we get refrsh token from cookies
    const incomingRefreshToken = req.cookies.refreshToken || req.body;
    if(!incomingRefreshToken){
        throw new ApiError(401 , "Unauthorized request!");
    }
    try{
        const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
        // check user in databases by decodeToken._id
        const user = await User.findById(decodedToken._id);
        if(!user){
            throw new ApiError(401 , "Invalid refresh Token");
        }
        // match the incoming refresh token and user refrsh token
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401 , "refrsh token is expired or used");
        }
        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken , refreshToken } = await generateAccessAndRefreshToken(user._id);
        return res.status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , refreshToken , options)
        .json(
            new ApiResponse(
                200 ,
                {accessToken , refreshToken},
                "Access Token refrshed"
            )
        )
    }
    catch(error){
        throw new ApiError(401 , error?.message || "Invalid refresh token");
    }
})
const changePassPin = asyncHandler(async(req , res)=>{
    const {oldPassPin , newPassPin} = req.body;
    if(newPassPin.length !== 6){
        throw new ApiError(401 , "Enter valid oldpassword");
    }
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassPin);
    if(!isPasswordCorrect){
        throw new ApiError(400 , "Inavlid old password");
    }
    user.passpin = newPassPin;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200 , {} ,"Password change successfully"));
})
const updateAccountDetails = asyncHandler(async(req , res)=>{
    const {username , email} = req.body;
    if(!username || !email){
        throw new ApiError(400 , "All fields are required");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                username: username,
                email: email
            }
        },
        {new: true}
    ).select("-password")
    return res.status(200).json(
        new ApiResponse(200 , user , "Account update successfully")
    );
})
const updateAvatar = asyncHandler(async(req , res)=>{
    // user (file)-> multer-> temp -> cloudinary-> url
    // check all 
    // req -> user._id user fetch in databases avatar url -> url
    // return res
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is required");
    } 
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar){
        throw new ApiError(400 , "error while uploading on cloud!"); 
    }
    const user = await User.findByIdAndUpdate(req.user?._id , {
        $set:{
            avatar : avatar
        }
    },
    {new : true}
    ).select("-password");
    return res.status(200).json(new ApiResponse(
        200 , user , "Avatar file upload successfully"
    ))
})
export {
    registerUser,
    loginUser,
    logOutUser,
    refreshTokenAccessToken,
    changePassPin,
    updateAccountDetails,
    updateAvatar,
}