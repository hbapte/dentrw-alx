import mongoose, { Document, Model, Schema } from "mongoose";

interface User extends Document {
    names: string;
    email: string;
    username?: string; 
    password?: string; 
    emailVerified: boolean;
    emailVerificationToken: string;
    emailVerificationTokenCreated: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    googleId?: string; 
    picture?: string;  
}

const userSchema: Schema = new Schema({
    names: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true },
    password: { type: String },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationTokenCreated: { type: Date, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    googleId: { type: String, unique: true },
    picture: String,
});

const User: Model<User> = mongoose.model<User>("User", userSchema);

export default User;
