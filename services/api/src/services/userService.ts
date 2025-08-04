import { User, CreateUserRequest, UpdateUserRequest } from '../types';
import prisma from './prismaService';
import bcrypt from 'bcrypt';

export class UserService {
  /**
   * Create a new user
   */
  public static async createUser(userData: CreateUserRequest): Promise<User> {
    const userDataForPrisma: any = {
      email: userData.email,
    };

    if (userData.name) {
      userDataForPrisma.name = userData.name;
    }

    if (userData.auth0Sub) {
      userDataForPrisma.auth0Sub = userData.auth0Sub;
    }

    // Only hash password if provided (for non-Auth0 users)
    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userDataForPrisma.passwordHash = hashedPassword;
    }
    
    const user = await prisma.user.create({
      data: userDataForPrisma
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      auth0Sub: user.auth0Sub,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  /**
   * Get user by ID
   */
  public static async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      auth0Sub: user.auth0Sub,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  /**
   * Get user by email
   */
  public static async getUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      auth0Sub: user.auth0Sub,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  /**
   * Get user by Auth0 sub ID
   */
  public static async getUserByAuth0Sub(auth0Sub: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { auth0Sub }
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      auth0Sub: user.auth0Sub,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  /**
   * Update user
   */
  public static async updateUser(id: string, userData: UpdateUserRequest): Promise<User | null> {
    const user = await prisma.user.update({
      where: { id },
      data: userData
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      auth0Sub: user.auth0Sub,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  /**
   * Delete user
   */
  public static async deleteUser(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  /**
   * Get all users (for admin use)
   */
  public static async getAllUsers(): Promise<User[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      auth0Sub: user.auth0Sub,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
  }

  /**
   * Verify user password
   */
  public static async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true }
    });

    if (!user || !user.passwordHash) return false;

    return bcrypt.compare(password, user.passwordHash);
  }
} 