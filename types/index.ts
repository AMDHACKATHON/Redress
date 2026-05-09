export type Stage = 'understand' | 'draft' | 'escalate';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  country: string | null;
  complaint_count: number;
  created_at: string;
}

export interface Complaint {
  _id: string;
  userId: string;
  summary: string;
  stage: Stage;
  letterGenerated: boolean;
  escalationGenerated: boolean;
  complaintType: string | null;
  country: string | null;
  createdAt: string;
}

export interface Message {
  _id: string;
  complaintId: string;
  role: 'user' | 'agent';
  content: string;
  createdAt: string;
}

export interface Letter {
  _id: string;
  complaintId: string;
  letter: string;
  recipient: string;
  channel: string;
  regulatorName: string;
  regulatorContact: string;
  regulatorCountry: string;
  createdAt: string;
}

export interface EscalationLetter {
  _id: string;
  complaintId: string;
  escalationLetter: string;
  regulatorName: string;
  regulatorContact: string;
  filingInstructions: string;
  createdAt: string;
}

export interface AgentReply {
  messageId: string;
  reply: string;
  stage: Stage;
  ready_for_letter: boolean;
  clarifying_questions_done: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ComplaintDetail extends Complaint {
  messages: Message[];
}
