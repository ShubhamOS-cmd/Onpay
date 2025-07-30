import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema = new Schema({
    username:{
         type : String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
    },
    email:{
            type : String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
    },
    phoneno:{
            type:Number,
            required: [true , 'PhoneNo is required'],
            unique: true,
            index: true,
    },
    pin:{
        type: String,
            required: true,
    },
    avatar:{
        type : String, // cloudnary url
            required: true,
    },
    refreshToken:{
        type: String,
    },
    acc_id:{
        type:Number,
        required:true,
    },
},{timestamps: true})

// encrypt password before save
userSchema.pre("save" , async function (next) {
    if(!this.isModified("pin"))return next();
    this.pin = await bcrypt.hash(this.pin , 10);
    next(); 
})

// check password 
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password , this.password) // return true or false
    // password -> the password is send by user 
    // this.password the password is which is in databases
}

// genrate acess andrefresh token 

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        username: this.username,
        phoneno: this.phoneno
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    },
)
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    },
    )
}
export const User = mongoose.model("User" , userSchema);