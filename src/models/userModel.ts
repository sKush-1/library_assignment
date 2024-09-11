import mongoose from "mongoose";

const Books_DB = mongoose.connection.useDb('lib_DB')

interface User {
    username: string;
    email: string,
    password: string

}
const userSchema = new mongoose.Schema<User> ({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}

})

export const User = Books_DB.model<User>('User', userSchema)


