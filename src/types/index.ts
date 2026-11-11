export type LeadStatus = 'HOT' | 'OPEN' | 'NEW' | 'QUALIFIED' | 'IN PROGRESS' | 'PENDING';

export type LeadSource = 'Website' | 'LinkedIn' | 'X' | 'Facebook' | 'Instagram' | 'Referral';

export type UserSystemRole = 'admin' | 'specialist' | 'member';

export type UserStatus = 'Active' | 'Invited' | 'Suspended' | 'Out of Office';

export interface Manager {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  password?: string;
  phone?: string;
  userRole?: UserSystemRole;
  status?: UserStatus;
  department?: string;
  specialties: string[];
  region: string;
  activeLeads: number;
  maxCapacity: number;
  joinedDate?: string;
}

export interface ScheduledCall {
  date: string;
  time: string;
  type?: 'Phone' | 'Google Meet' | 'Zoom' | 'Teams';
  notes?: string;
  status?: 'Scheduled' | 'Completed' | 'Cancelled';
  updatedAt?: string;
}

export interface Lead {
  id: string;
  customer: string;
  company: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  manager: string; // manager name
  managerId?: string;
  source: LeadSource;
  score: number; // 1 to 10
  created: string;
  focusArea?: string;
  message?: string;
  isFavourite?: boolean;
  isOverdue?: boolean;
  scheduledCall?: ScheduledCall;
  aiInsights?: {
    tags: string[];
    urgency: 'Low' | 'Medium' | 'High' | 'Critical';
    estimatedBudget?: string;
    domain: string;
    assignedReason: string;
    confidence: number; // e.g. 95%
    autoAssigned: boolean;
    engine?: string;
  };
}

export interface MetricStat {
  count: number;
  changePercent: number;
  trend?: number[];
}

export interface LeadStats {
  newLeads: MetricStat;
  qualifiedLeads: MetricStat;
  avgResponseTime: { value: string; changePercent: number; trend?: number[] };
  hotLeads: MetricStat;
  totalCount: number;
}
