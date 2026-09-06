import mongoose, { Schema, Document } from "mongoose";

export type CampaignStatus = "Draft" | "Running" | "Scheduled" | "Completed" | "Paused" | "Failed";

export interface ICampaign extends Document {
  name: string;
  description?: string;
  template: string;
  category?: string;
  recipients: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  status: CampaignStatus;
  campaignType?: string;
  account?: string;
  audience?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  attachments?: { name: string; size: number; type: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    template: { type: String, required: true, default: "default_template" },
    category: { type: String },
    recipients: { type: Number, required: true, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Draft", "Running", "Scheduled", "Completed", "Paused", "Failed"],
      default: "Draft",
    },
    campaignType: { type: String },
    account: { type: String },
    audience: { type: String },
    scheduledDate: { type: String },
    scheduledTime: { type: String },
    attachments: [
      {
        name: { type: String },
        size: { type: Number },
        type: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const Campaign = mongoose.model<ICampaign>("Campaign", CampaignSchema);
