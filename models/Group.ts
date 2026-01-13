import mongoose, { Schema, model, models } from 'mongoose';

export interface IGroup {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  templateId: mongoose.Types.ObjectId;
  intervalDays: number; // How often to send (default 30 for monthly)
  isActive: boolean; // Can pause entire group
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    intervalDays: {
      type: Number,
      required: true,
      default: 30,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
GroupSchema.index({ userId: 1, isActive: 1 });

export default models.Group || model<IGroup>('Group', GroupSchema);
