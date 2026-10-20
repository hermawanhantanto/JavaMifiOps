import { prisma } from '../../config/prisma';
import { ConflictError } from '../../common/errors';
import type { AddDeviceInput } from './device.validator';

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
}

export const deviceService = new DeviceService();
