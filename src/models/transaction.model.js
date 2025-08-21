import mongoose ,  {Schema} from "mongoose";

const transactionSchema = new Schema({
    // models
},{timestamps:true});

export const Transaction = mongoose.model("Transaction" , paymentSchema);