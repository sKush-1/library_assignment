import mongoose, { Mongoose } from "mongoose";
import { string } from "zod";

const Transaction_DB = mongoose.connection.useDb('transaction')

interface BookTransaction {
    userId: mongoose.Schema.Types.ObjectId;
    bookName: string;
    username: string;
    issuedDate: string;
    returnedDate: string;
    status: string;
    totalRentPaid: number;
}

enum statusType {
    Issued = 'issued',
    Returned = 'returned',
}

const bookTransactionSchema = new mongoose.Schema<BookTransaction> ({
    userId: {type: mongoose.Schema.Types.ObjectId, required: true},
    bookName: {type: String, required: true},
    username: {type: String, required: true},
    issuedDate: {type: String, required: true},
    returnedDate: {type: String},
    totalRentPaid: {type: Number},
    status: {
        type: String,
        default: statusType.Issued,
        enum: Object.values(statusType),
    }
})

export const BookTransaction = Transaction_DB.model<BookTransaction>('BookTransaction', bookTransactionSchema);


