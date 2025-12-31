import mongoose, { Schema, model, models } from 'mongoose';

export interface ISchedule {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  subscriberId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  scheduleType: 'monthly' | 'interval';
  dayOfMonth?: number; // For monthly (1-31)
  intervalDays?: number; // For interval (e.g., every 30 days)
  nextSendDate: Date;
  lastSentDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscriberId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscriber',
      required: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    scheduleType: {
      type: String,
      enum: ['monthly', 'interval'],
      required: true,
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
    },
    intervalDays: {
      type: Number,
      min: 1,
    },
    nextSendDate: {
      type: Date,
      required: true,
      index: true,
    },
    lastSentDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ScheduleSchema.index({ userId: 1, isActive: 1 });
ScheduleSchema.index({ nextSendDate: 1, isActive: 1 });

const Schedule = models?.Schedule || model<ISchedule>('Schedule', ScheduleSchema);

export default Schedule;
