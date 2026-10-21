import { Router, type Request, type Response } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess } from '../../common/response';
import { NotFoundError, BadRequestError } from '../../common/errors';
import { DeviceStatus } from '../../generated/prisma/enums.js';

const publicRouter: Router = Router();

/**
 * Endpoint: GET /api/public/devices
 * Public catalog of currently available pocket Wi-Fi hardware devices.
 * Used by customer inquiry bots, n8n AI agents, and marketing pages.
 */
publicRouter.get('/devices', async (req: Request, res: Response) => {
  const devices = await prisma.device.findMany({
    where: {
      status: DeviceStatus.AVAILABLE,
    },
    select: {
      id: true,
      model: true,
      speed: true,
      dailyRate: true,
      batteryHealth: true,
      status: true,
    },
    orderBy: {
      dailyRate: 'asc',
    },
  });

  return sendSuccess(res, 'Available devices retrieved successfully', { devices }, 200);
});

/**
 * Endpoint: GET /api/public/rental/track/:code
 * Public lookup for booking tracking & fulfillment status using Rental Code.
 * Used by customer support bots, n8n AI agents, and tracking pages.
 * Strictly conceals internal hardware identifiers (IMEI, serialNumber).
 */
publicRouter.get('/rental/track/:code', async (req: Request, res: Response) => {
  const rentalCode = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
  if (!rentalCode || rentalCode.trim().length === 0) {
    throw new BadRequestError('Rental code is required');
  }

  const rental = await prisma.rental.findUnique({
    where: {
      rentalCode: rentalCode.trim(),
    },
    select: {
      rentalCode: true,
      destination: true,
      startDate: true,
      endDate: true,
      totalDays: true,
      totalAmount: true,
      status: true,
      fulfillmentType: true,
      pickupLocation: true,
      shippingAddress: true,
      trackingNumber: true,
      device: {
        select: {
          model: true,
          speed: true,
        },
      },
    },
  });

  if (!rental) {
    throw new NotFoundError(`Rental booking with code ${rentalCode} was not found`);
  }

  return sendSuccess(res, 'Rental tracking details retrieved successfully', { rental }, 200);
});

export default publicRouter;
