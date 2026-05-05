export type Stage = 'understand' | 'draft' | 'escalate';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  country: string;
  complaint_count: number;
  created_at: string;
}

export interface Complaint {
  complaint_id: string;
  summary: string;
  stage: Stage;
  letter_generated: boolean;
  escalation_generated: boolean;
  created_at: string;
}

export interface Message {
  message_id: string;
  role: 'user' | 'agent';
  content: string;
  created_at: string;
}

export interface Letter {
  letter_id: string;
  letter: string;
  recipient: string;
  channel: string;
  regulator: {
    name: string;
    contact: string;
    country: string;
  };
  created_at: string;
}

export interface EscalationLetter {
  escalation_id: string;
  escalation_letter: string;
  regulator: {
    name: string;
    contact: string;
    filing_instructions: string;
  };
  created_at: string;
}

export interface AgentReply {
  message_id: string;
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
