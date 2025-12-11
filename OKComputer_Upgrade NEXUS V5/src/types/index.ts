export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: Role;
  agencyId?: string;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum Role {
  RECRUIT = "RECRUIT",
  AGENT = "AGENT", 
  SENIOR_AGENT = "SENIOR_AGENT",
  MANAGER = "MANAGER",
  AGENCY_OWNER = "AGENCY_OWNER",
  FOUNDER = "FOUNDER",
  PLATFORM_OWNER = "PLATFORM_OWNER"
}

export interface DashboardStats {
  totalLeads: number;
  contactedLeads: number;
  setAppointments: number;
  closedDeals: number;
  weeklyAP: number;
  monthlyAP: number;
  appointmentsToday: number;
  dialsToday: number;
}

export interface FinanceSummary {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyLeadSpend: number;
  taxReserve: number;
  savingsProgress: number;
  netIncome: number;
}

export interface TeamPerformance {
  teamId: string;
  teamName: string;
  managerName: string;
  totalAgents: number;
  weeklyAP: number;
  monthlyAP: number;
  totalApps: number;
}

export interface DriftAlert {
  id: string;
  type: 'production_drop' | 'under_dialing' | 'no_appointments' | 'low_activity';
  severity: 'low' | 'medium' | 'high';
  description: string;
  resolved: boolean;
  userId: string;
  createdAt: Date;
}

export interface AIMentorResponse {
  advice: string;
  actionItems: string[];
  scriptSuggestion?: string;
  driftAlert?: DriftAlert;
}