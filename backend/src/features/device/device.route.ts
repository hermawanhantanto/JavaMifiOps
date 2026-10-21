import { Router } from 'express';
import {
  addDeviceHandler,
  getDeviceByIdHandler,
  listDevicesHandler,
  updateDeviceHandler,
  deleteDeviceHandler,
} from './device.handler';
import { authenticateToken, requireRole } from '../../middlewares/auth.middleware';

const deviceRouter: Router = Router();

/**
 * Endpoint: GET /api/device
 * Lists all devices with optional query filters (status, search, page, limit).
 * Accessible to any authenticated user (Admin or Customer).
 */
deviceRouter.get('/', authenticateToken, listDevicesHandler);

/**
 * Endpoint: POST /api/device/add-device
 * Allows only users with the ADMIN role to register a new device.
 */
deviceRouter.post('/add-device', authenticateToken, requireRole('ADMIN'), addDeviceHandler);

/**
 * Endpoint: GET /api/device/:id
 * Retrieves a single device by its ID.
 * Accessible to any authenticated user (Admin or Customer).
 */
deviceRouter.get('/:id', authenticateToken, getDeviceByIdHandler);

/**
 * Endpoint: PUT /api/device/:id
 * Updates an existing device by its ID.
 * Allows only users with the ADMIN role.
 */
deviceRouter.put('/:id', authenticateToken, requireRole('ADMIN'), updateDeviceHandler);

/**
 * Endpoint: DELETE /api/device/:id
 * Deletes a brand-new device asset that has no rental history.
 * Allows only users with the ADMIN role.
 */
deviceRouter.delete('/:id', authenticateToken, requireRole('ADMIN'), deleteDeviceHandler);

export default deviceRouter;
