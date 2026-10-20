import { Router } from 'express';
import { addDeviceHandler } from './device.handler';
import { authenticateToken, requireRole } from '../../middlewares/auth.middleware';

const deviceRouter: Router = Router();

/**
 * Endpoint: POST /api/device/add-device
 * Allows only users with the ADMIN role to register a new device.
 */
deviceRouter.post('/add-device', authenticateToken, requireRole('ADMIN'), addDeviceHandler);

export default deviceRouter;
