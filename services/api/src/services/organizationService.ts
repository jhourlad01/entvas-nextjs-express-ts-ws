import { Organization, CreateOrganizationRequest, UpdateOrganizationRequest } from '../types';
import prisma from './prismaService';

export class OrganizationService {
  /**
   * Create a new organization
   */
  public static async createOrganization(userId: string, orgData: CreateOrganizationRequest): Promise<Organization> {
    const organization = await prisma.organization.create({
      data: {
        name: orgData.name,
        ...(orgData.description && { description: orgData.description }),
        userId
      }
    });

    return {
      id: organization.id,
      name: organization.name,
      description: organization.description,
      userId: organization.userId,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt
    };
  }

  /**
   * Get organization by ID
   */
  public static async getOrganizationById(id: string): Promise<Organization | null> {
    const organization = await prisma.organization.findUnique({
      where: { id }
    });

    if (!organization) return null;

    return {
      id: organization.id,
      name: organization.name,
      description: organization.description,
      userId: organization.userId,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt
    };
  }

  /**
   * Get organizations owned by a user
   */
  public static async getOrganizationsByUserId(userId: string): Promise<Organization[]> {
    const organizations = await prisma.organization.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return organizations.map(org => ({
      id: org.id,
      name: org.name,
      description: org.description,
      userId: org.userId,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt
    }));
  }

  /**
   * Update organization
   */
  public static async updateOrganization(id: string, userId: string, orgData: UpdateOrganizationRequest): Promise<Organization | null> {
    // Verify ownership
    const existing = await prisma.organization.findFirst({
      where: { id, userId }
    });

    if (!existing) return null;

    const organization = await prisma.organization.update({
      where: { id },
      data: orgData
    });

    return {
      id: organization.id,
      name: organization.name,
      description: organization.description,
      userId: organization.userId,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt
    };
  }

  /**
   * Delete organization
   */
  public static async deleteOrganization(id: string, userId: string): Promise<boolean> {
    try {
      // Verify ownership
      const existing = await prisma.organization.findFirst({
        where: { id, userId }
      });

      if (!existing) return false;

      await prisma.organization.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting organization:', error);
      return false;
    }
  }

  /**
   * Get all organizations (for admin use)
   */
  public static async getAllOrganizations(): Promise<Organization[]> {
    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return organizations.map(org => ({
      id: org.id,
      name: org.name,
      description: org.description,
      userId: org.userId,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt
    }));
  }

  /**
   * Check if user owns organization
   */
  public static async userOwnsOrganization(userId: string, organizationId: string): Promise<boolean> {
    const organization = await prisma.organization.findFirst({
      where: { id: organizationId, userId }
    });

    return !!organization;
  }
} 