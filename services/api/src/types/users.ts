// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  description: string | null;
  userId: string; // Owner
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationRequest {
  name: string;
  description?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
}

// API Key types
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  organizationId: string;
  userId: string;
  createdAt: Date;
  lastUsedAt?: Date;
}

export interface CreateApiKeyRequest {
  name: string;
  organizationId: string;
}

// Multi-tenancy context
export interface TenantContext {
  userId: string;
  organizationId?: string;
  isAdmin: boolean;
} 