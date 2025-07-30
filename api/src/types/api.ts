import { ValidationErrorDetail } from './validation';

// API response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationErrorDetail[];
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
} 