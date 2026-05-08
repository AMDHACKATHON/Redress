import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  complaintId: mongoose.Types.ObjectId;
  role: 'user' | 'agent';
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  complaintId: {
    type: Schema.Types.ObjectId,
    ref: 'Complaint',
    required: [true, 'Complaint ID is required'],
  },
  role: {
    type: String,
    enum: ['user', 'agent'],
    required: [true, 'Role is required'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
