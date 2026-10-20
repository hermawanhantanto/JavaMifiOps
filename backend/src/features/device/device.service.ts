import { prisma } from '../../config/prisma';
import { ConflictError, NotFoundError } from '../../common/errors';
import type { AddDeviceInput, ListDeviceQuery } from './device.validator';
import { buildDeviceWhereInput, buildDeviceSelect } from './device.helper';
import type { Role } from '../../generated/prisma/enums.js';

export class DeviceService {
  /**
   * Registers a new hardware device asset in the inventory.
   * Performs conflict detection on unique hardware identifiers (serialNumber, imei).
   */
  async addDevice(input: AddDeviceInput) {
    const existingDevice = await prisma.device.findFirst({
      where: {
        OR: [
          { serialNumber: input.serialNumber },
          { imei: input.imei },
        ],
      },
    });

    if (existingDevice && existingDevice.serialNumber === input.serialNumber) {
      throw new ConflictError('Device with this Serial Number already exists');
    }

    if (existingDevice && existingDevice.imei === input.imei) {
      throw new ConflictError('Device with this IMEI already exists');
    }

    const device = await prisma.device.create({
      data: {
        serialNumber: input.serialNumber,
        imei: input.imei,
        model: input.model,
        batteryHealth: input.batteryHealth,
        speed: input.speed,
        dailyRate: input.dailyRate,
      },
    });

    return device;
  }

  /**
   * Retrieves a single device by its unique ID.
   * Throws NotFoundError if the device does not exist.
   * Selects only permissible fields directly at the database level based on role.
   */
  async getDeviceById(id: string, role?: Role) {
    const select = buildDeviceSelect(role);

    const device = await prisma.device.findUnique({
      where: { id },
      select,
    });

    if (!device) {
      throw new NotFoundError('Device not found');
    }

    return device;
  }

  /**
   * Retrieves a paginated list of devices with optional filtering.
   * Supports filtering by status, speed, and role-aware keyword search.
   * Uses prisma.$transaction for snapshot read consistency across findMany and count.
   * Selects only permissible fields directly at the database level based on role.
   */
  async listDevices(query: ListDeviceQuery, role?: Role) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const where = buildDeviceWhereInput(query, role);
    const select = buildDeviceSelect(role);

    const [devices, total] = await prisma.$transaction([
      prisma.device.findMany({
        where,
        select,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.device.count({ where }),
    ]);

    return {
      devices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const deviceService = new DeviceService();
