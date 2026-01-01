import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  image?: string;
  googleId: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = models?.User || model<IUser>('User', UserSchema);

export default User;
