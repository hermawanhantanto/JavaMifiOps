import { Router } from 'express';
import { handlePaymentNotification } from './payment.handler.js';

const paymentRouter: Router = Router();

paymentRouter.post('/notification', handlePaymentNotification);

export default paymentRouter;
