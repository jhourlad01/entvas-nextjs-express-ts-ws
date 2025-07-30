// Validation error detail
export interface ValidationErrorDetail {
  path: (string | number)[];
  message: string;
  type: string;
} 