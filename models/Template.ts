import mongoose, { Schema, model, models } from 'mongoose';
import type { EmailBlock } from '@/types/email-blocks';

export interface ITemplate {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  subject: string;
  body: string; // Legacy text-based templates
  blocks?: EmailBlock[]; // New block-based templates
  isBlockBased?: boolean; // Flag to determine template type
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: false, // Not required for block-based templates
    },
    blocks: {
      type: Schema.Types.Mixed,
      required: false,
    },
    isBlockBased: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

TemplateSchema.index({ userId: 1 });

const Template = models?.Template || model<ITemplate>('Template', TemplateSchema);

export default Template;
