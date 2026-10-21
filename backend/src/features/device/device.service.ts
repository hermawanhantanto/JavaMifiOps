import { prisma } from '../../config/prisma';
import { BadRequestError, ConflictError, NotFoundError } from '../../common/errors';
import type {
  AddDeviceInput,
  ListDeviceQuery,
  UpdateDeviceInput,
  DeviceResponse,
  SingleDeviceResult,
  ListDevicesResult,
} from './device.dto.js';
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
  async addDevice(input: AddDeviceInput): Promise<DeviceResponse> {
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
  async getDeviceById(id: string, role?: Role): Promise<SingleDeviceResult> {
    const select = buildDeviceSelect(role);

    const device = await prisma.device.findUnique({
      where: { id },
      select,
    });

    if (!device) {
      throw new NotFoundError('Device not found');
    }

    return device as SingleDeviceResult;
  }

  /**
   * Retrieves a paginated list of devices with optional filtering.
   * Supports filtering by status, speed, and role-aware keyword search.
   * Uses prisma.$transaction for snapshot read consistency across findMany and count.
   * Selects only permissible fields directly at the database level based on role.
   */
  async listDevices(query: ListDeviceQuery, role?: Role): Promise<ListDevicesResult> {
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
      devices: devices as SingleDeviceResult[],
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
  async updateDevice(id: string, input: UpdateDeviceInput): Promise<DeviceResponse> {
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

    return updatedDevice as DeviceResponse;
  }

  /**
   * Permanently deletes a brand-new hardware device asset.
   * Enforces business rules:
   * - Prevents deletion if the device has ever been linked to a rental.
   * Devices with historical associations should have their status transitioned to RETIRED instead.
   */
  async deleteDevice(id: string): Promise<void> {
    const device = await prisma.device.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rentals: true,
          },
        },
      },
    });

    if (!device) {
      throw new NotFoundError('Device not found');
    }

    if (device._count.rentals > 0) {
      throw new BadRequestError(
        'Cannot delete device with rental history. Update status to RETIRED instead'
      );
    }

    await prisma.device.delete({
      where: { id },
    });
  }
}

export const deviceService = new DeviceService();
