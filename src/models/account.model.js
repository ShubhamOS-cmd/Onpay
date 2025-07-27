import mongoose , {Schema} from "mongoose";

const accountSchema = new Schema({})

export const Account = mongoose.model("Account" , accountSchema);