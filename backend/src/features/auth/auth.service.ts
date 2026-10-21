import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../common/errors';
import type {
  SignupInput,
  SigninInput,
  SigninResult,
  UpdateProfileInput,
  UserResponse,
} from './auth.dto.js';

export class AuthService {
  /**
   * Registers a new user.
   * Encapsulates all business logic and database interactions.
   */
  async signup(input: SignupInput): Promise<UserResponse> {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError('Email is already registered');
    }

    // 2. Hash the password with bcrypt (salt rounds = 10)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    // 3. Persist new user in the database
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        phone: input.phone_number,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Authenticates user credentials.
   * Returns sanitized user information and generated JWT token.
   * Intentionally uses generic error message to prevent user enumeration / brute force guessing.
   */
  async signin(input: SigninInput): Promise<SigninResult> {
    // 1. Verify user existence
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedError('Email or password wrong');
    }

    // 2. Verify password match
    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Email or password wrong');
    }

    // 3. Generate JWT token using validated environment configuration
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      }
    );

    // 4. Return sanitized user data and token
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }

  /**
   * Retrieves profile details for the authenticated user.
   */
  async getMe(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Updates profile details (name, phone, address) for the authenticated user.
   */
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}

export const authService = new AuthService();
