import type { Prisma } from '../../generated/prisma/client.js';
import { Role } from '../../generated/prisma/enums.js';
import type { ListDeviceQuery, DeviceConflictCheckParams } from './device.dto.js';

/**
 * Builds a type-safe Prisma WhereInput filter object from list query parameters.
 * When the caller is a Customer, search is restricted strictly to the model field.
 * When the caller is an Admin, search checks serialNumber, imei, and model.
 */
export const buildDeviceWhereInput = (
  query: ListDeviceQuery,
  role?: Role
): Prisma.DeviceWhereInput => {
  const where: Prisma.DeviceWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.speed) {
    where.speed = query.speed;
  }

  if (query.search) {
    if (role === Role.CUSTOMER) {
      where.model = { contains: query.search, mode: 'insensitive' };
    } else {
      where.OR = [
        { serialNumber: { contains: query.search, mode: 'insensitive' } },
        { imei: { contains: query.search, mode: 'insensitive' } },
        { model: { contains: query.search, mode: 'insensitive' } },
      ];
    }
  }

  return where;
};

/**
 * Builds a Prisma select projection object based on the caller's role.
 * Ensures the database query fetches only permissible fields, eliminating
 * in-memory iteration/mapping overhead while guarding sensitive hardware identifiers.
 */
export const buildDeviceSelect = (role?: Role): Prisma.DeviceSelect => {
  if (role === Role.CUSTOMER) {
    return {
      id: true,
      model: true,
      batteryHealth: true,
      speed: true,
      dailyRate: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  return {
    id: true,
    serialNumber: true,
    imei: true,
    model: true,
    batteryHealth: true,
    speed: true,
    dailyRate: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  };
};

/**
 * Builds a Prisma WhereInput query to check for conflicts on unique hardware identifiers (serialNumber, imei).
 * Optionally excludes a specific device ID (useful when updating existing records).
 * Returns null if neither serialNumber nor imei is provided.
 */
export const buildDeviceConflictWhereInput = (
  params: DeviceConflictCheckParams,
  excludeId?: string
): Prisma.DeviceWhereInput | null => {
  const conditions: Prisma.DeviceWhereInput[] = [];

  if (params.serialNumber) {
    conditions.push({ serialNumber: params.serialNumber });
  }

  if (params.imei) {
    conditions.push({ imei: params.imei });
  }

  if (!conditions.length) {
    return null;
  }

  const where: Prisma.DeviceWhereInput = {
    OR: conditions,
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  return where;
};
