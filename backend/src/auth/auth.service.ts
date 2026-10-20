import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { ConflictError } from '../common/errors';
import type { SignupInput } from './auth.validator';

export class AuthService {
  /**
   * Registers a new user.
   * Encapsulates all business logic and database interactions.
   */
  async signup(input: SignupInput) {
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
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}

export const authService = new AuthService();
