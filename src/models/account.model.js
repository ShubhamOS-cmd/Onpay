import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt"
const accountSchema = new Schema(
    {
        name:{
            type: String,
            required: true,
            lowercase: true,
            trim: true, 
        },
        phoneno:{
            type:Number,
            required: [true , 'PhoneNo is required'],
            unique: true,
        },
        email:{
            type : String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        pincode:{
            type : Number,
            required: true,
        },
        Balance:{
            type:Number,
            required: true,
        },
        password:{
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)
accountSchema.pre("save" , async function (next) {
    if(!this.isModified("password"))return next();
    this.password = await bcrypt.hash(this.password , 10);
    next();
})
export const Account = mongoose.model("Account" , accountSchema);