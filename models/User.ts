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

// Only add indexes in Node.js runtime (not Edge/browser)
if (typeof process !== 'undefined' && process.versions?.node) {
  UserSchema.index({ email: 1 });
  UserSchema.index({ googleId: 1 });
}

const User = models?.User || model<IUser>('User', UserSchema);

export default User;
