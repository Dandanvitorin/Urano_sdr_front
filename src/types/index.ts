export type LeadState =
  | "new" | "welcomed" | "qualifying" | "qualified"
  | "scheduling" | "scheduled" | "disqualified"
  | "followup_d1" | "followup_d2" | "followup_d3"
  | "followup_d4" | "followup_d5" | "followup_d6" | "followup_d7"
  | "no_response" | "converted" | "lost" | "handoff_requested";

export interface CurrentUser {
  user_id: string;
  name: string;
  email: string;
  role: "admin" | "seller";
  company_id: string;
  default_channel_id?: string | null;
}

export interface Lead {
  phone: string;
  name: string;
  state: LeadState;
  email?: string | null;
  product_plan?: "pro_max" | "elite" | null;
  company_name?: string | null;
  business_segment?: string | null;
  is_qualified: boolean;
  seller_id?: string | null;
  channel_id?: string | null;
  channel_name?: string | null;
  created_at: string;
  updated_at: string;
  last_interaction: string;
  is_pj?: boolean | null;
  employee_count?: number | null;
  monthly_revenue?: number | null;
  is_decision_maker?: boolean | null;
  current_tool?: string | null;
  disqualification_reason?: string | null;
  followup_count?: number;
  nudge_sent?: boolean;
  source?: string | null;
  handoff_requested?: boolean;
  state_before_followup?: string | null;
  state_before_objection?: string | null;
  company_id?: string | null;
  recent_messages?: ConversationMessage[];
}

export interface ConversationMessage {
  sender: "user" | "agent" | "system";
  message: string;
  agent_name: string;
  timestamp: string;
  state?: string;
}

export interface PendingResponse {
  id: string;
  lead_id: string;
  lead_name: string;
  lead_phone: string;
  lead_channel_id?: string | null;
  user_message: string;
  ai_response: string;
  edited_response: string | null;
  agent_used: string;
  lead_state: string;
  status: "pending" | "approved" | "rejected" | "edited";
  reviewed_by: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface Stats {
  total_leads: number;
  qualified_leads: number;
  scheduled_meetings: number;
  pending_responses: number;
  by_state: Record<string, number>;
  qualification_rate: number;
  scheduling_rate: number;
}

export interface TeamUser {
  user_id: string;
  name: string;
  email: string;
  role: "admin" | "seller";
  is_active: boolean;
  default_channel_id?: string | null;
  created_at: string;
}

export interface WebhookCredentials {
  api_key: string;
  webhook_secret: string;
  webhook_url: string;
  headers: Record<string, string>;
}

export interface MicrosoftStatus {
  connected: boolean;
  email?: string;
  configured: boolean;
}

export interface FeedbackPayload {
  lead_phone: string;
  agent_name: string;
  user_message: string;
  agent_response: string;
  lead_state: string;
  rating: number;
  comment: string;
}

export interface ReviewPayload {
  action: "approve" | "reject" | "edit";
  edited_response?: string;
  rating?: number;
  approval_reason?: string;
  rejection_reason?: string;
  ideal_response?: string;
  channel_id?: string;
}

export interface Channel {
  id: string;
  name: string;
  phone_number: string;
  crm_channel_id: string | null;
  is_active: boolean;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface CRMConfig {
  configured: boolean;
  api_key_masked: string | null;
  user_email: string | null;
  source?: "db" | "env" | null;
  env_available?: boolean;
}

export interface TrelloConfig {
  configured: boolean;
  trello_key_masked: string | null;
  allowed_board_ids: string;
  seller_id: string | null;
  product_plan: "pro_max" | "elite";
  is_active: boolean;
  source?: "db" | "env" | null;
  env_available?: boolean;
}

export interface UranoCRMSettings {
  produto_pro_max: number | null;
  produto_elite: number | null;
  origem: number | null;
  oportunidade_id: number | null;
  fila_id: number | null;
  lead_estado: string | null;
  fila_observacoes_aceite: string | null;
  vendedor_id: number | null;
  sdr_id: number | null;
  venda_meio: string | null;
  contrato_escritorio_id: number | null;
}

export interface SSEEvent {
  type: string;
  [key: string]: unknown;
}

export interface AnalyticsData {
  funnel: {
    new: number;
    welcomed: number;
    qualifying: number;
    qualified: number;
    scheduling: number;
    scheduled: number;
    converted: number;
    lost: number;
    disqualified: number;
    no_response: number;
    handoff_requested: number;
    followup_total: number;
    followup_breakdown: Record<string, number>;
  };
  conversion_rates: {
    welcome_to_qualifying: number;
    qualifying_to_qualified: number;
    qualified_to_scheduled: number;
    scheduled_to_converted: number;
    overall: number;
    disqualification_rate: number;
    no_response_rate: number;
  };
  agents: Record<string, {
    total: number;
    approved: number;
    rejected: number;
    edited: number;
    approval_rate: number;
  }>;
  quality: {
    total_reviewed: number;
    approved: number;
    rejected: number;
    edited: number;
    approval_rate: number;
    edit_rate: number;
    rejection_rate: number;
    avg_rating: number;
    feedback_examples: {
      approved_count: number;
      rejected_count: number;
    };
  };
  leads_over_time: Array<{
    date: string;
    new_leads: number;
    converted: number;
    lost: number;
  }>;
}
