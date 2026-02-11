export enum RiskLevel {
  LOW = 'Low',
  MODERATE = 'Moderate',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface MonitoringNode {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  ph: number;
  do: number; // Dissolved Oxygen
  bod: number; // Biochemical Oxygen Demand
  turbidity: number;
  qualityScore: number;
  historicalAverage: number;
  riskLevel: RiskLevel;
  prediction: {
    score: number;
    trend: 'improving' | 'degrading' | 'stable';
    next6Hrs: RiskLevel;
  };
}

export interface CrowdZone {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  radius: number; // meters
  occupancy: number; // percentage 0-100
  headcount: number;
  flowRate: number; // people per minute
  riskLevel: RiskLevel;
  trend: 'increasing' | 'decreasing' | 'stable';
  droneId: string;
  nextEvent: string;
}

export interface BasinEvent {
  id: string;
  name: string;
  date: string;
  impactLevel: 'Low' | 'Medium' | 'High';
  description: string;
}

export interface GeminiAnalysisResult {
  text: string;
  riskAssessment: string;
  recommendation: string;
}