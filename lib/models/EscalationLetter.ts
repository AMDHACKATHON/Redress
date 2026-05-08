import mongoose, { Schema, Document } from 'mongoose';

export interface IEscalationLetter extends Document {
  complaintId: mongoose.Types.ObjectId;
  escalationLetter: string;
  regulatorName: string;
  regulatorContact: string;
  filingInstructions: string;
  createdAt: Date;
}

const EscalationLetterSchema = new Schema<IEscalationLetter>({
  complaintId: {
    type: Schema.Types.ObjectId,
    ref: 'Complaint',
    required: [true, 'Complaint ID is required'],
    unique: true,
  },
  escalationLetter: {
    type: String,
    required: [true, 'Escalation letter content is required'],
  },
  regulatorName: {
    type: String,
    required: [true, 'Regulator name is required'],
  },
  regulatorContact: {
    type: String,
    required: [true, 'Regulator contact is required'],
  },
  filingInstructions: {
    type: String,
    required: [true, 'Filing instructions are required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.EscalationLetter || mongoose.model<IEscalationLetter>('EscalationLetter', EscalationLetterSchema);
