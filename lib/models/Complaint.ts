import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaint extends Document {
  userId: mongoose.Types.ObjectId;
  summary: string | null;
  stage: 'understand' | 'draft' | 'escalate' | 'resolved';
  letterGenerated: boolean;
  escalationGenerated: boolean;
  complaintType: string | null;
  country: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  summary: {
    type: String,
    default: null,
  },
  stage: {
    type: String,
    enum: ['understand', 'draft', 'escalate', 'resolved'],
    default: 'understand',
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  letterGenerated: {
    type: Boolean,
    default: false,
  },
  escalationGenerated: {
    type: Boolean,
    default: false,
  },
  complaintType: {
    type: String,
    default: null,
  },
  country: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);
