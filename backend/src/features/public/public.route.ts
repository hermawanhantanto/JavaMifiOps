import { Router } from 'express';
import {
  cancelPublicRentalHandler,
  listPublicDevicesHandler,
  trackPublicRentalHandler,
  updatePublicRentalLogisticsHandler,
} from './public.handler';

const publicRouter: Router = Router();

/**
 * Endpoint: GET /api/public/devices
 * Public catalog of currently available pocket Wi-Fi hardware devices.
 */
publicRouter.get('/devices', listPublicDevicesHandler);

/**
 * Endpoint: GET /api/public/rental/track/:code
 * Public lookup for booking tracking, fulfillment status, and payment link using Rental Code.
 */
publicRouter.get('/rental/track/:code', trackPublicRentalHandler);

/**
 * Endpoint: POST /api/public/rental/update-logistics
 * Self-service fulfillment modification (2FA verified via rentalCode + email).
 */
publicRouter.post('/rental/update-logistics', updatePublicRentalLogisticsHandler);

/**
 * Endpoint: POST /api/public/rental/cancel
 * Self-service unpaid booking cancellation and stock release (2FA verified via rentalCode + email).
 */
publicRouter.post('/rental/cancel', cancelPublicRentalHandler);

export default publicRouter;
