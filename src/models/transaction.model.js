import mongoose ,  {Schema} from "mongoose";

const transactionSchema = new Schema({
    sender:{
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    Amount:{
        type: Number,
        required: true
    },
    receiver:{
        type : Schema.Types.ObjectId,
        ref : "User"
    }
},{timestamps:true});

export const Transaction = mongoose.model("Transaction" , transactionSchema);