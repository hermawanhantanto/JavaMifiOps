import { prisma } from '../../config/prisma';
import { BadRequestError, ConflictError, NotFoundError } from '../../common/errors';
import type { AddDeviceInput, ListDeviceQuery, UpdateDeviceInput } from './device.dto.js';
import {
  buildDeviceWhereInput,
  buildDeviceSelect,
  buildDeviceConflictWhereInput,
} from './device.helper';
import { DeviceStatus, Role } from '../../generated/prisma/enums.js';

export class DeviceService {
  /**
   * Registers a new hardware device asset in the inventory.
   * Performs conflict detection on unique hardware identifiers (serialNumber, imei).
   */
  async addDevice(input: AddDeviceInput) {
    const conflictWhere = buildDeviceConflictWhereInput({
      serialNumber: input.serialNumber,
      imei: input.imei,
    });

    if (conflictWhere) {
      const existingDevice = await prisma.device.findFirst({
        where: conflictWhere,
      });

      if (existingDevice && existingDevice.serialNumber === input.serialNumber) {
        throw new ConflictError('Device with this Serial Number already exists');
      }

      if (existingDevice && existingDevice.imei === input.imei) {
        throw new ConflictError('Device with this IMEI already exists');
      }
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

  /**
   * Updates an existing hardware device.
   * Enforces business rules:
   * - Prevents transitioning a RENTED device to AVAILABLE directly.
   * - Validates hardware identifier uniqueness if serialNumber or imei is modified.
   */
  async updateDevice(id: string, input: UpdateDeviceInput) {
    const existingDevice = await prisma.device.findUnique({
      where: { id },
    });

    if (!existingDevice) {
      throw new NotFoundError('Device not found');
    }

    if (existingDevice.status === DeviceStatus.RENTED && input.status === DeviceStatus.AVAILABLE) {
      throw new BadRequestError('Cannot set status to AVAILABLE while device is actively rented');
    }

    const conflictWhere = buildDeviceConflictWhereInput(
      {
        serialNumber: input.serialNumber,
        imei: input.imei,
      },
      id
    );

    if (conflictWhere) {
      const conflictDevice = await prisma.device.findFirst({
        where: conflictWhere,
      });

      if (conflictDevice && conflictDevice.serialNumber === input.serialNumber) {
        throw new ConflictError('Device with this Serial Number already exists');
      }

      if (conflictDevice && conflictDevice.imei === input.imei) {
        throw new ConflictError('Device with this IMEI already exists');
      }
    }

    const select = buildDeviceSelect(Role.ADMIN);

    const updatedDevice = await prisma.device.update({
      where: { id },
      data: input,
      select,
    });

    return updatedDevice;
  }
}

export const deviceService = new DeviceService();
