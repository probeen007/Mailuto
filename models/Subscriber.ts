import mongoose, { Schema, model, models } from 'mongoose';

export interface ISubscriber {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  service: string;
  nextDate?: Date;
  customVariables?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
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
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    service: {
      type: String,
      required: true,
      trim: true,
    },
    nextDate: {
      type: Date,
      required: false,
    },
    customVariables: {
      type: Object,
      required: false,
      default: {},
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

SubscriberSchema.index({ userId: 1, email: 1 });

const Subscriber = models?.Subscriber || model<ISubscriber>('Subscriber', SubscriberSchema);

export default Subscriber;
