import mongoose, { Schema, Document } from "mongoose";

export interface IWhatsappAccount extends Document {
  name: string;
  number: string;
  status: "Connected" | "Disconnected";
  createdAt: Date;
  updatedAt: Date;
}

const WhatsappAccountSchema = new Schema<IWhatsappAccount>(
  {
    name: { type: String, required: true, trim: true },
    number: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Connected", "Disconnected"], default: "Disconnected" },
  },
  { timestamps: true }
);

export const WhatsappAccount = mongoose.model<IWhatsappAccount>("WhatsappAccount", WhatsappAccountSchema);
