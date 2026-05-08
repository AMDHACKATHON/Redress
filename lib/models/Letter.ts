import mongoose, { Schema, Document } from 'mongoose';

export interface ILetter extends Document {
  complaintId: mongoose.Types.ObjectId;
  letter: string;
  recipient: string;
  channel: string;
  regulatorName: string;
  regulatorContact: string;
  regulatorCountry: string;
  createdAt: Date;
}

const LetterSchema = new Schema<ILetter>({
  complaintId: {
    type: Schema.Types.ObjectId,
    ref: 'Complaint',
    required: [true, 'Complaint ID is required'],
    unique: true,
  },
  letter: {
    type: String,
    required: [true, 'Letter content is required'],
  },
  recipient: {
    type: String,
    required: [true, 'Recipient is required'],
  },
  channel: {
    type: String,
    required: [true, 'Channel is required'],
  },
  regulatorName: {
    type: String,
    required: [true, 'Regulator name is required'],
  },
  regulatorContact: {
    type: String,
    required: [true, 'Regulator contact is required'],
  },
  regulatorCountry: {
    type: String,
    required: [true, 'Regulator country is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Letter || mongoose.model<ILetter>('Letter', LetterSchema);
