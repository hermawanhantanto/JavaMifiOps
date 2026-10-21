import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma.js';
import {
  DeviceSpeed,
  DeviceStatus,
  FulfillmentType,
  PaymentGateway,
  PaymentStatus,
  RentalStatus,
  Role,
} from '../src/generated/prisma/enums.js';

interface SeedDevicePlan {
  serialNumber: string;
  imei: string;
  model: string;
  batteryHealth: number;
  speed: DeviceSpeed;
  dailyRate: number;
  status: DeviceStatus;
}

interface SeedRentalPlan {
  rentalCode: string;
  deviceSerialNumber: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalAmount: number;
  status: RentalStatus;
  fulfillmentType: FulfillmentType;
  pickupLocation: string | null;
  shippingAddress: string | null;
  trackingNumber: string | null;
  expiresAt: Date | null;
  payment: {
    id: string;
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
}

const DEVICES_DATA: SeedDevicePlan[] = [
  {
    serialNumber: 'JMF-NTG-M6P-001',
    imei: '359281070010001',
    model: 'Netgear Nighthawk M6 Pro (MR6500) 5G mmWave',
    batteryHealth: 100,
    speed: DeviceSpeed.SPEED_5G_1GBPS,
    dailyRate: 150000,
    status: DeviceStatus.AVAILABLE,
  },
  {
    serialNumber: 'JMF-INS-M30-002',
    imei: '359281070010002',
    model: 'Inseego MiFi X PRO 5G (M3000)',
    batteryHealth: 99,
    speed: DeviceSpeed.SPEED_5G_1GBPS,
    dailyRate: 135000,
    status: DeviceStatus.AVAILABLE,
  },
  {
    serialNumber: 'JMF-HWI-E68-003',
    imei: '864192050010003',
    model: 'Huawei 5G Mobile WiFi Pro (E6878-370)',
    batteryHealth: 98,
    speed: DeviceSpeed.SPEED_5G_1GBPS,
    dailyRate: 120000,
    status: DeviceStatus.AVAILABLE,
  },
  {
    serialNumber: 'JMF-SKY-S5G-004',
    imei: '866734050010004',
    model: 'Skyroam Solis 5G Global Hotspot & Power Bank',
    batteryHealth: 97,
    speed: DeviceSpeed.SPEED_5G_500MBPS,
    dailyRate: 105000,
    status: DeviceStatus.AVAILABLE,
  },
  {
    serialNumber: 'JMF-ZTE-MU5-005',
    imei: '864192050010005',
    model: 'ZTE MU5001 5G Sub-6 Mobile Hotspot',
    batteryHealth: 95,
    speed: DeviceSpeed.SPEED_5G_500MBPS,
    dailyRate: 95000,
    status: DeviceStatus.AVAILABLE,
  },
  {
    serialNumber: 'JMF-TPL-M76-006',
    imei: '863810050010006',
    model: 'TP-Link M7650 600Mbps LTE-Advanced',
    batteryHealth: 93,
    speed: DeviceSpeed.SPEED_4G_300MBPS,
    dailyRate: 70000,
    status: DeviceStatus.AVAILABLE,
  },
  {
    serialNumber: 'JMF-HWI-E57-007',
    imei: '864192050010007',
    model: 'Huawei E5785-320a 4G LTE-Advanced',
    batteryHealth: 94,
    speed: DeviceSpeed.SPEED_4G_300MBPS,
    dailyRate: 60000,
    status: DeviceStatus.RENTED,
  },
  {
    serialNumber: 'JMF-GCL-DT4-008',
    imei: '865123040010008',
    model: 'GlocalMe DuoTurbo Dual-Modem 4G',
    batteryHealth: 92,
    speed: DeviceSpeed.SPEED_4G_150MBPS,
    dailyRate: 50000,
    status: DeviceStatus.RENTED,
  },
  {
    serialNumber: 'JMF-ALC-MW4-009',
    imei: '865123040010009',
    model: 'Alcatel LINKZONE 2 Cat6 Hotspot (MW43TM)',
    batteryHealth: 90,
    speed: DeviceSpeed.SPEED_4G_150MBPS,
    dailyRate: 45000,
    status: DeviceStatus.BOOKED,
  },
  {
    serialNumber: 'JMF-TPL-M73-010',
    imei: '863810050010010',
    model: 'TP-Link M7350 4G LTE Mobile Wi-Fi',
    batteryHealth: 88,
    speed: DeviceSpeed.SPEED_4G_150MBPS,
    dailyRate: 40000,
    status: DeviceStatus.BOOKED,
  },
];

const RENTALS_DATA: SeedRentalPlan[] = [
  {
    rentalCode: 'RENT-20261021-TK5G01',
    deviceSerialNumber: 'JMF-HWI-E57-007',
    destination: 'Tokyo & Kyoto, Japan',
    startDate: new Date('2026-10-19T00:00:00.000Z'),
    endDate: new Date('2026-10-25T00:00:00.000Z'),
    totalDays: 7,
    totalAmount: 420000,
    status: RentalStatus.ACTIVE,
    fulfillmentType: FulfillmentType.AIRPORT_PICKUP,
    pickupLocation: 'Jakarta Soekarno-Hatta (CGK) T3 Departure Gate 1 (24/7)',
    shippingAddress: null,
    trackingNumber: null,
    expiresAt: null,
    payment: {
      id: 'PAY-20261021-TK5G01',
      gatewayRef: 'MID-REF-TK5G01',
      gateway: PaymentGateway.MIDTRANS,
      paymentMethod: 'bca_va',
      amount: 420000,
      status: PaymentStatus.PAID,
      snapToken: 'snap-token-tk5g01',
      redirectUrl: 'https://app.sandbox.midtrans.com/snap/v4/redirection/snap-token-tk5g01',
      paidAt: new Date('2026-10-18T09:15:00.000Z'),
      expiresAt: null,
    },
  },
  {
    rentalCode: 'RENT-20261021-SL4G02',
    deviceSerialNumber: 'JMF-GCL-DT4-008',
    destination: 'Seoul & Busan, South Korea',
    startDate: new Date('2026-10-15T00:00:00.000Z'),
    endDate: new Date('2026-10-19T00:00:00.000Z'),
    totalDays: 5,
    totalAmount: 250000,
    status: RentalStatus.OVERDUE,
    fulfillmentType: FulfillmentType.HOME_DELIVERY,
    pickupLocation: null,
    shippingAddress: 'Jl. Jend. Sudirman Kav. 52-53, Senayan, Jakarta Selatan',
    trackingNumber: 'JNE-YES-8829100231',
    expiresAt: null,
    payment: {
      id: 'PAY-20261021-SL4G02',
      gatewayRef: 'MID-REF-SL4G02',
      gateway: PaymentGateway.MIDTRANS,
      paymentMethod: 'qris',
      amount: 250000,
      status: PaymentStatus.PAID,
      snapToken: 'snap-token-sl4g02',
      redirectUrl: 'https://app.sandbox.midtrans.com/snap/v4/redirection/snap-token-sl4g02',
      paidAt: new Date('2026-10-14T14:20:00.000Z'),
      expiresAt: null,
    },
  },
  {
    rentalCode: 'RENT-20261021-SG4G03',
    deviceSerialNumber: 'JMF-ALC-MW4-009',
    destination: 'Singapore',
    startDate: new Date('2026-10-25T00:00:00.000Z'),
    endDate: new Date('2026-10-28T00:00:00.000Z'),
    totalDays: 4,
    totalAmount: 180000,
    status: RentalStatus.CONFIRMED,
    fulfillmentType: FulfillmentType.AIRPORT_PICKUP,
    pickupLocation: 'Jakarta Soekarno-Hatta (CGK) T3 Departure Gate 1 (24/7)',
    shippingAddress: null,
    trackingNumber: null,
    expiresAt: null,
    payment: {
      id: 'PAY-20261021-SG4G03',
      gatewayRef: 'MID-REF-SG4G03',
      gateway: PaymentGateway.MIDTRANS,
      paymentMethod: 'credit_card',
      amount: 180000,
      status: PaymentStatus.PAID,
      snapToken: 'snap-token-sg4g03',
      redirectUrl: 'https://app.sandbox.midtrans.com/snap/v4/redirection/snap-token-sg4g03',
      paidAt: new Date('2026-10-21T08:00:00.000Z'),
      expiresAt: null,
    },
  },
  {
    rentalCode: 'RENT-20261021-KL4G04',
    deviceSerialNumber: 'JMF-TPL-M73-010',
    destination: 'Kuala Lumpur & Penang, Malaysia',
    startDate: new Date('2026-11-01T00:00:00.000Z'),
    endDate: new Date('2026-11-05T00:00:00.000Z'),
    totalDays: 5,
    totalAmount: 200000,
    status: RentalStatus.PENDING_PAYMENT,
    fulfillmentType: FulfillmentType.AIRPORT_PICKUP,
    pickupLocation: 'Jakarta Soekarno-Hatta (CGK) T2 Departure Gate 4 (24/7)',
    shippingAddress: null,
    trackingNumber: null,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    payment: {
      id: 'PAY-20261021-KL4G04',
      gatewayRef: 'MID-REF-KL4G04',
      gateway: PaymentGateway.MIDTRANS,
      paymentMethod: null,
      amount: 200000,
      status: PaymentStatus.PENDING,
      snapToken: 'snap-token-kl4g04',
      redirectUrl: 'https://app.sandbox.midtrans.com/snap/v4/redirection/snap-token-kl4g04',
      paidAt: null,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  {
    rentalCode: 'RENT-20260910-BK5G05',
    deviceSerialNumber: 'JMF-NTG-M6P-001',
    destination: 'Bangkok & Chiang Mai, Thailand',
    startDate: new Date('2026-09-10T00:00:00.000Z'),
    endDate: new Date('2026-09-15T00:00:00.000Z'),
    totalDays: 6,
    totalAmount: 900000,
    status: RentalStatus.RETURNED,
    fulfillmentType: FulfillmentType.AIRPORT_PICKUP,
    pickupLocation: "Bali I Gusti Ngurah Rai (DPS) Int'l Departure (24/7)",
    shippingAddress: null,
    trackingNumber: null,
    expiresAt: null,
    payment: {
      id: 'PAY-20260910-BK5G05',
      gatewayRef: 'MID-REF-BK5G05',
      gateway: PaymentGateway.MIDTRANS,
      paymentMethod: 'bca_va',
      amount: 900000,
      status: PaymentStatus.PAID,
      snapToken: 'snap-token-bk5g05',
      redirectUrl: 'https://app.sandbox.midtrans.com/snap/v4/redirection/snap-token-bk5g05',
      paidAt: new Date('2026-09-08T11:30:00.000Z'),
      expiresAt: null,
    },
  },
  {
    rentalCode: 'RENT-20260820-SY5G06',
    deviceSerialNumber: 'JMF-INS-M30-002',
    destination: 'Sydney & Melbourne, Australia',
    startDate: new Date('2026-08-20T00:00:00.000Z'),
    endDate: new Date('2026-08-27T00:00:00.000Z'),
    totalDays: 8,
    totalAmount: 1080000,
    status: RentalStatus.RETURNED,
    fulfillmentType: FulfillmentType.HOME_DELIVERY,
    pickupLocation: null,
    shippingAddress: 'Jl. Jend. Sudirman Kav. 52-53, Senayan, Jakarta Selatan',
    trackingNumber: 'JNE-REG-7718293100',
    expiresAt: null,
    payment: {
      id: 'PAY-20260820-SY5G06',
      gatewayRef: 'MID-REF-SY5G06',
      gateway: PaymentGateway.MIDTRANS,
      paymentMethod: 'mandiri_va',
      amount: 1080000,
      status: PaymentStatus.PAID,
      snapToken: 'snap-token-sy5g06',
      redirectUrl: 'https://app.sandbox.midtrans.com/snap/v4/redirection/snap-token-sy5g06',
      paidAt: new Date('2026-08-18T16:45:00.000Z'),
      expiresAt: null,
    },
  },
  {
    rentalCode: 'RENT-20260712-PR5G07',
    deviceSerialNumber: 'JMF-HWI-E68-003',
    destination: 'Paris, France & Zurich, Switzerland',
    startDate: new Date('2026-07-12T00:00:00.000Z'),
    endDate: new Date('2026-07-21T00:00:00.000Z'),
    totalDays: 10,
    totalAmount: 1200000,
    status: RentalStatus.RETURNED,
    fulfillmentType: FulfillmentType.AIRPORT_PICKUP,
    pickupLocation: 'Jakarta Soekarno-Hatta (CGK) T3 Departure Gate 1 (24/7)',
    shippingAddress: null,
    trackingNumber: null,
    expiresAt: null,
    payment: {
      id: 'PAY-20260712-PR5G07',
      gatewayRef: 'MID-REF-PR5G07',
      gateway: PaymentGateway.MIDTRANS,
      paymentMethod: 'credit_card',
      amount: 1200000,
      status: PaymentStatus.PAID,
      snapToken: 'snap-token-pr5g07',
      redirectUrl: 'https://app.sandbox.midtrans.com/snap/v4/redirection/snap-token-pr5g07',
      paidAt: new Date('2026-07-10T10:00:00.000Z'),
      expiresAt: null,
    },
  },
  {
    rentalCode: 'RENT-20260605-TP5G08',
    deviceSerialNumber: 'JMF-SKY-S5G-004',
    destination: 'Taipei, Taiwan',
    startDate: new Date('2026-06-05T00:00:00.000Z'),
    endDate: new Date('2026-06-09T00:00:00.000Z'),
    totalDays: 5,
    totalAmount: 525000,
    status: RentalStatus.RETURNED,
    fulfillmentType: FulfillmentType.AIRPORT_PICKUP,
    pickupLocation: 'Surabaya Juanda (SUB) Terminal 2 Departure (24/7)',
    shippingAddress: null,
    trackingNumber: null,
    expiresAt: null,
    payment: {
      id: 'PAY-20260605-TP5G08',
      gatewayRef: 'MID-REF-TP5G08',
      gateway: PaymentGateway.MIDTRANS,
      paymentMethod: 'qris',
      amount: 525000,
      status: PaymentStatus.PAID,
      snapToken: 'snap-token-tp5g08',
      redirectUrl: 'https://app.sandbox.midtrans.com/snap/v4/redirection/snap-token-tp5g08',
      paidAt: new Date('2026-06-03T19:10:00.000Z'),
      expiresAt: null,
    },
  },
  {
    rentalCode: 'RENT-20260518-HK5G09',
    deviceSerialNumber: 'JMF-ZTE-MU5-005',
    destination: 'Hong Kong & Macau',
    startDate: new Date('2026-05-18T00:00:00.000Z'),
    endDate: new Date('2026-05-22T00:00:00.000Z'),
    totalDays: 5,
    totalAmount: 475000,
    status: RentalStatus.CANCELLED,
    fulfillmentType: FulfillmentType.AIRPORT_PICKUP,
    pickupLocation: 'Jakarta Soekarno-Hatta (CGK) T3 Departure Gate 1 (24/7)',
    shippingAddress: null,
    trackingNumber: null,
    expiresAt: new Date('2026-05-15T12:30:00.000Z'),
    payment: {
      id: 'PAY-20260518-HK5G09',
      gatewayRef: 'MID-REF-HK5G09',
      gateway: PaymentGateway.MIDTRANS,
      paymentMethod: null,
      amount: 475000,
      status: PaymentStatus.EXPIRED,
      snapToken: 'snap-token-hk5g09',
      redirectUrl: 'https://app.sandbox.midtrans.com/snap/v4/redirection/snap-token-hk5g09',
      paidAt: null,
      expiresAt: new Date('2026-05-15T12:30:00.000Z'),
    },
  },
  {
    rentalCode: 'RENT-20260410-DB4G10',
    deviceSerialNumber: 'JMF-TPL-M76-006',
    destination: 'Dubai, United Arab Emirates',
    startDate: new Date('2026-04-10T00:00:00.000Z'),
    endDate: new Date('2026-04-16T00:00:00.000Z'),
    totalDays: 7,
    totalAmount: 490000,
    status: RentalStatus.CANCELLED,
    fulfillmentType: FulfillmentType.HOME_DELIVERY,
    pickupLocation: null,
    shippingAddress: 'Jl. Jend. Sudirman Kav. 52-53, Senayan, Jakarta Selatan',
    trackingNumber: null,
    expiresAt: new Date('2026-04-08T15:00:00.000Z'),
    payment: {
      id: 'PAY-20260410-DB4G10',
      gatewayRef: 'MID-REF-DB4G10',
      gateway: PaymentGateway.MIDTRANS,
      paymentMethod: null,
      amount: 490000,
      status: PaymentStatus.FAILED,
      snapToken: 'snap-token-db4g10',
      redirectUrl: 'https://app.sandbox.midtrans.com/snap/v4/redirection/snap-token-db4g10',
      paidAt: null,
      expiresAt: new Date('2026-04-08T15:00:00.000Z'),
    },
  },
];

async function main(): Promise<void> {
  console.log('[INFO] Starting database seed...');

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('Password123!', salt);

  // 1. Seed 1 Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@javamifi.com' },
    update: {
      name: 'JavaMifi Administrator',
      passwordHash: defaultPasswordHash,
      phone: '628111000111',
      address: 'JavaMifi Central Hub, Jl. Tomang Raya No. 12, Jakarta Barat',
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@javamifi.com',
      name: 'JavaMifi Administrator',
      passwordHash: defaultPasswordHash,
      phone: '628111000111',
      address: 'JavaMifi Central Hub, Jl. Tomang Raya No. 12, Jakarta Barat',
      role: Role.ADMIN,
    },
  });
  console.log(`[INFO] Seeded Admin user: ${adminUser.email}`);

  // 2. Seed 1 Customer User
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@javamifi.com' },
    update: {
      name: 'Budi Santoso',
      passwordHash: defaultPasswordHash,
      phone: '6281234567890',
      address: 'Jl. Jend. Sudirman Kav. 52-53, Senayan, Jakarta Selatan',
      role: Role.CUSTOMER,
    },
    create: {
      email: 'customer@javamifi.com',
      name: 'Budi Santoso',
      passwordHash: defaultPasswordHash,
      phone: '6281234567890',
      address: 'Jl. Jend. Sudirman Kav. 52-53, Senayan, Jakarta Selatan',
      role: Role.CUSTOMER,
    },
  });
  console.log(`[INFO] Seeded Customer user: ${customerUser.email}`);

  // 3. Seed 10 Devices
  const deviceMap = new Map<string, string>();
  for (const item of DEVICES_DATA) {
    const device = await prisma.device.upsert({
      where: { serialNumber: item.serialNumber },
      update: {
        imei: item.imei,
        model: item.model,
        batteryHealth: item.batteryHealth,
        speed: item.speed,
        dailyRate: item.dailyRate,
        status: item.status,
      },
      create: {
        serialNumber: item.serialNumber,
        imei: item.imei,
        model: item.model,
        batteryHealth: item.batteryHealth,
        speed: item.speed,
        dailyRate: item.dailyRate,
        status: item.status,
      },
    });
    deviceMap.set(item.serialNumber, device.id);
  }
  console.log(`[INFO] Seeded ${DEVICES_DATA.length} hardware devices.`);

  // 4. Seed 10 Rentals + 10 Payments for Customer 1
  for (const plan of RENTALS_DATA) {
    const deviceId = deviceMap.get(plan.deviceSerialNumber) ?? null;

    const rental = await prisma.rental.upsert({
      where: { rentalCode: plan.rentalCode },
      update: {
        userId: customerUser.id,
        deviceId,
        destination: plan.destination,
        startDate: plan.startDate,
        endDate: plan.endDate,
        totalDays: plan.totalDays,
        totalAmount: plan.totalAmount,
        status: plan.status,
        fulfillmentType: plan.fulfillmentType,
        pickupLocation: plan.pickupLocation,
        shippingAddress: plan.shippingAddress,
        trackingNumber: plan.trackingNumber,
        expiresAt: plan.expiresAt,
      },
      create: {
        rentalCode: plan.rentalCode,
        userId: customerUser.id,
        deviceId,
        destination: plan.destination,
        startDate: plan.startDate,
        endDate: plan.endDate,
        totalDays: plan.totalDays,
        totalAmount: plan.totalAmount,
        status: plan.status,
        fulfillmentType: plan.fulfillmentType,
        pickupLocation: plan.pickupLocation,
        shippingAddress: plan.shippingAddress,
        trackingNumber: plan.trackingNumber,
        expiresAt: plan.expiresAt,
      },
    });

    await prisma.payment.upsert({
      where: { id: plan.payment.id },
      update: {
        rentalId: rental.id,
        gatewayRef: plan.payment.gatewayRef,
        gateway: plan.payment.gateway,
        paymentMethod: plan.payment.paymentMethod,
        amount: plan.payment.amount,
        status: plan.payment.status,
        snapToken: plan.payment.snapToken,
        redirectUrl: plan.payment.redirectUrl,
        paidAt: plan.payment.paidAt,
        expiresAt: plan.payment.expiresAt,
      },
      create: {
        id: plan.payment.id,
        rentalId: rental.id,
        gatewayRef: plan.payment.gatewayRef,
        gateway: plan.payment.gateway,
        paymentMethod: plan.payment.paymentMethod,
        amount: plan.payment.amount,
        status: plan.payment.status,
        snapToken: plan.payment.snapToken,
        redirectUrl: plan.payment.redirectUrl,
        paidAt: plan.payment.paidAt,
        expiresAt: plan.payment.expiresAt,
      },
    });
  }
  console.log(
    `[INFO] Seeded ${RENTALS_DATA.length} rentals and ${RENTALS_DATA.length} payments for customer ${customerUser.email}.`
  );
  console.log('[INFO] Database seeding completed successfully.');
}

main()
  .catch((error: unknown) => {
    console.error('[ERROR] Database seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
