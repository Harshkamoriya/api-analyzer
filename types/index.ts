// Database types
export interface TestRun {
  id: string;
  userId: string;
  url: string;
  method: string;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  statusCodes: Record<string, number> | null;
  aiTips: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// API response types
export interface TestResult {
  success: boolean;
  avgLatency?: number;
  minLatency?: number;
  maxLatency?: number;
  statusCodes?: Record<string, number>;
  aiTips?: string;
  error?: string;
}

// Form data types
export interface TestConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
}