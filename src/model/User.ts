import mongoose, { Schema, Document } from 'mongoose';

// Here we are defining the type for the message schema
export interface Message extends Document {
   content: string;
   createdAt: Date;
}

// Here we are defining the message schema
const messageSchema: Schema<Message> = new Schema({
   content: {
      type: String,
      required: true,
   },
   createdAt: {
      type: Date,
      required: true,
      default: Date.now,
   },
});

// Here we are defining the type for the user schema
export interface User extends Document {
   username: string;
   email: string;
   password: string;
   verifyCode: string;
   verifyCodeExpiry: Date;
   isVerified: boolean;
   isAcceptingMessage: boolean;
   message: Message[];
}

// Here we are defining the user schema
const userSchema: Schema<User> = new Schema({
   username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      unique: true,
   },
   email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [
         /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
         'Please fill a valid email address',
      ],
   },
   password: {
      type: String,
      required: [true, 'Password is required'],
   },
   verifyCode: {
      type: String,
      required: [true, 'Verification code is required'],
   },
   verifyCodeExpiry: {
      type: Date,
      required: [true, 'Verification code expiry is required'],
   },
   isVerified: {
      type: Boolean,
      required: [true, 'Verification status is required'],
      default: false,
   },
   isAcceptingMessage: {
      type: Boolean,
      default: true,
   },
   message: [messageSchema],
});

// Here we are exporting the user model
/*
-> If the model is already defined, we will use that model.
-> If the model is not defined, we will define the model.

mongoose.models.User as mongoose.Model<User> -> This is used to check if the model is already defined and also to get the type of the model (User Model).

mongoose.model<User>('User', userSchema) -> This is used to define the model if the model is not already defined.
*/
export const User =
   (mongoose.models.User as mongoose.Model<User>) ||
   mongoose.model<User>('User', userSchema);
