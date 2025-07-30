import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Account} from "../models/account.model.js";
import mongoose from "mongoose";

const registerAccount = asyncHandler(async(req , res) => {

});

export {
    registerAccount,
}