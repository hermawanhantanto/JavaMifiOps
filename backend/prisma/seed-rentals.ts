import { prisma } from '../src/config/prisma.js';
import {
  RentalStatus,
  PaymentGateway,
  PaymentStatus,
  DeviceStatus,
} from '../src/generated/prisma/enums.js';

const TARGET_USER_ID = 'cmvhphzgd0000r0fnx6g3yq7p';

interface DummyRentalPlan {
  rentalCode: string;
  deviceSerialNumber: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalAmount: number;
  status: RentalStatus;
  expiresAt: Date | null;
  payment: {
    gatewayRef: string;
    gateway: PaymentGateway;
    paymentMethod: string | null;
    amount: number;
    status: PaymentStatus;
    snapToken: string;
    redirectUrl: string;
    paidAt: Date | null;
    expiresAt: Date | null;
  };
  deviceStatusToSet?: DeviceStatus;
}

const RENTAL_PLANS: DummyRentalPlan[] = [
  {
    rentalCode: 'RENT-20261018-JP5G01',
    deviceSerialNumber: 'NTG-MR520-2408',
    destination: 'Tokyo & Osaka, Japan',
    startDate: new Date('2026-10-18T00:00:00.000Z'),
    endDate: new Date('2026-10-25T00:00:00.000Z'),
    totalDays: 8,
    totalAmount: 1080000,
    status: RentalStatus.ACTIVE,
    expiresAt: null,
    payment: {
      gatewayRef: 'PAY-20261017-JP5G01',
      gateway: PaymentGateway.MIDTRANS,
      paymentMethod: 'credit_card',
      amount: 1080000,
      status: PaymentStatus.PAID,
      snapToken: 'tok-snap-tokyo-20261017',
      redirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/tok-snap-tokyo-20261017',
      paidAt: new Date('2026-10-17T10:30:00.000Z'),
      expiresAt: null,
    },
    deviceStatusToSet: DeviceStatus.RENTED,
  },
  {
    rentalCode: 'RENT-20261020-KR5G02',
    deviceSerialNumber: 'HWI-E6878-2406',
    destination: 'Seoul, South Korea',
    startDate: new Date('2026-11-05T00:00:00.000Z'),
    endDate: new Date('2026-11-12T00:00:00.000Z'),
    totalDays: 8,
    totalAmount: 1000000,
    status: RentalStatus.CONFIRMED,
    expiresAt: null,
    payment: {
      gatewayRef: 'PAY-20261020-KR5G02',
      gateway: PaymentGateway.MIDTRANS,
      paymentMethod: 'bank_transfer_bca',
      amount: 1000000,
      status: PaymentStatus.PAID,
      snapToken: 'tok-snap-seoul-20261020',
      redirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/tok-snap-seoul-20261020',
      paidAt: new Date('2026-10-20T14:45:00.000Z'),
      expiresAt: null,
    },
    deviceStatusToSet: DeviceStatus.BOOKED,
  },
  {
    rentalCode: 'RENT-20261021-SGMY03',
    deviceSerialNumber: 'GCL-G4P-202401',
    destination: 'Singapore & Kuala Lumpur, Malaysia',
    startDate: new Date('2026-11-15T00:00:00.000Z'),
    endDate: new Date('2026-11-20T00:00:00.000Z'),
    totalDays: 6,
    totalAmount: 300000,
    status: RentalStatus.PENDING_PAYMENT,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    payment: {
      gatewayRef: 'PAY-20261021-SGMY03',
      gateway: PaymentGateway.MIDTRANS,
      paymentMethod: null,
      amount: 300000,
      status: PaymentStatus.PENDING,
      snapToken: 'tok-snap-sgmy-20261021',
      redirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/tok-snap-sgmy-20261021',
      paidAt: null,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
    deviceStatusToSet: DeviceStatus.BOOKED,
  },
  {
    rentalCode: 'RENT-20260905-TH4G04',
    deviceSerialNumber: 'HWI-E5785-2405',
    destination: 'Bangkok & Phuket, Thailand',
    startDate: new Date('2026-09-08T00:00:00.000Z'),
    endDate: new Date('2026-09-14T00:00:00.000Z'),
    totalDays: 7,
    totalAmount: 420000,
    status: RentalStatus.RETURNED,
    expiresAt: null,
    payment: {
      gatewayRef: 'PAY-20260905-TH4G04',
      gateway: PaymentGateway.MIDTRANS,
      paymentMethod: 'qris_gopay',
      amount: 420000,
      status: PaymentStatus.PAID,
      snapToken: 'tok-snap-th-20260905',
      redirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/tok-snap-th-20260905',
      paidAt: new Date('2026-09-05T16:10:00.000Z'),
      expiresAt: null,
    },
    deviceStatusToSet: DeviceStatus.AVAILABLE,
  },
  {
    rentalCode: 'RENT-20260815-EU5G05',
    deviceSerialNumber: 'ZTE-MU500-2411',
    destination: 'Paris, France & Amsterdam, Netherlands',
    startDate: new Date('2026-08-20T00:00:00.000Z'),
    endDate: new Date('2026-08-28T00:00:00.000Z'),
    totalDays: 9,
    totalAmount: 855000,
    status: RentalStatus.CANCELLED,
    expiresAt: null,
    payment: {
      gatewayRef: 'PAY-20260815-EU5G05',
      gateway: PaymentGateway.MIDTRANS,
      paymentMethod: null,
      amount: 855000,
      status: PaymentStatus.EXPIRED,
      snapToken: 'tok-snap-eu-20260815',
      redirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/tok-snap-eu-20260815',
      paidAt: null,
      expiresAt: new Date('2026-08-15T10:00:00.000Z'),
    },
    deviceStatusToSet: DeviceStatus.AVAILABLE,
  },
];

async function seedUserRentals(): Promise<void> {
  console.log(`[INFO] Seeding rental and payment dummy data for user: ${TARGET_USER_ID}...`);

  const user = await prisma.user.findUnique({
    where: { id: TARGET_USER_ID },
  });

  if (!user) {
    console.error(`[ERROR] User with ID ${TARGET_USER_ID} not found in database.`);
    process.exit(1);
  }

  for (const plan of RENTAL_PLANS) {
    const device = await prisma.device.findUnique({
      where: { serialNumber: plan.deviceSerialNumber },
    });

    if (!device) {
      console.warn(`[WARN] Device ${plan.deviceSerialNumber} not found, skipping rental ${plan.rentalCode}`);
      continue;
    }

    const existingRental = await prisma.rental.findUnique({
      where: { rentalCode: plan.rentalCode },
    });

    let rentalId: string;

    if (existingRental) {
      const updated = await prisma.rental.update({
        where: { id: existingRental.id },
        data: {
          destination: plan.destination,
          startDate: plan.startDate,
          endDate: plan.endDate,
          totalDays: plan.totalDays,
          totalAmount: plan.totalAmount,
          status: plan.status,
          expiresAt: plan.expiresAt,
          deviceId: device.id,
        },
      });
      rentalId = updated.id;
      console.log(`[INFO] Updated existing rental: ${plan.rentalCode}`);
    } else {
      const created = await prisma.rental.create({
        data: {
          rentalCode: plan.rentalCode,
          userId: user.id,
          deviceId: device.id,
          destination: plan.destination,
          startDate: plan.startDate,
          endDate: plan.endDate,
          totalDays: plan.totalDays,
          totalAmount: plan.totalAmount,
          status: plan.status,
          expiresAt: plan.expiresAt,
        },
      });
      rentalId = created.id;
      console.log(`[INFO] Created new rental: ${plan.rentalCode}`);
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { gatewayRef: plan.payment.gatewayRef },
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          rentalId,
          amount: plan.payment.amount,
          status: plan.payment.status,
          gateway: plan.payment.gateway,
          paymentMethod: plan.payment.paymentMethod,
          snapToken: plan.payment.snapToken,
          redirectUrl: plan.payment.redirectUrl,
          paidAt: plan.payment.paidAt,
          expiresAt: plan.payment.expiresAt,
        },
      });
      console.log(`[INFO] Updated payment for rental: ${plan.rentalCode}`);
    } else {
      await prisma.payment.create({
        data: {
          rentalId,
          gatewayRef: plan.payment.gatewayRef,
          amount: plan.payment.amount,
          status: plan.payment.status,
          gateway: plan.payment.gateway,
          paymentMethod: plan.payment.paymentMethod,
          snapToken: plan.payment.snapToken,
          redirectUrl: plan.payment.redirectUrl,
          paidAt: plan.payment.paidAt,
          expiresAt: plan.payment.expiresAt,
        },
      });
      console.log(`[INFO] Created payment for rental: ${plan.rentalCode}`);
    }

    if (plan.deviceStatusToSet) {
      await prisma.device.update({
        where: { id: device.id },
        data: { status: plan.deviceStatusToSet },
      });
    }
  }

  const finalRentals = await prisma.rental.findMany({
    where: { userId: TARGET_USER_ID },
    include: {
      payments: true,
      device: true,
    },
  });

  console.log(`[INFO] Seeding completed successfully. User ${user.email} now has ${finalRentals.length} rentals.`);
}

seedUserRentals()
  .catch((error: unknown) => {
    console.error('[ERROR] Seeding rentals failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
