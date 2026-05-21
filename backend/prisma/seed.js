require('dotenv').config();
const { PrismaClient } = require('../src/generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create Districts
  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
    'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna',
    'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa',
    'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura',
    'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'
  ];

  for (const name of districts) {
    await prisma.district.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('✅ Districts seeded');

  // Create Fine Categories
  const categories = [
    { name: 'Speeding', description: 'Exceeding speed limit', amount: 3000 },
    { name: 'Running Red Light', description: 'Ignoring traffic signals', amount: 5000 },
    { name: 'No Helmet', description: 'Riding without helmet', amount: 1000 },
    { name: 'Drunk Driving', description: 'Driving under influence', amount: 25000 },
    { name: 'No Licence', description: 'Driving without valid licence', amount: 15000 },
    { name: 'Overloading', description: 'Vehicle overloading', amount: 5000 },
    { name: 'Wrong Parking', description: 'Illegal parking', amount: 2000 },
    { name: 'No Insurance', description: 'Driving without insurance', amount: 10000 },
    { name: 'Mobile Phone Use', description: 'Using mobile while driving', amount: 3000 },
    { name: 'Seat Belt Violation', description: 'Not wearing seat belt', amount: 1500 },
  ];

  for (const cat of categories) {
    await prisma.fineCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Fine categories seeded');

  // Create Admin user
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@trafficfines.lk' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@trafficfines.lk',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user seeded: admin@trafficfines.lk / Admin@123');

  // Create Officer user
  const officerPassword = await bcrypt.hash('Officer@123', 10);
  const officerUser = await prisma.user.upsert({
    where: { email: 'officer@trafficfines.lk' },
    update: {},
    create: {
      name: 'Test Officer',
      email: 'officer@trafficfines.lk',
      password: officerPassword,
      role: 'OFFICER',
    },
  });

  // Get Colombo district
  const colombo = await prisma.district.findUnique({ where: { name: 'Colombo' } });

  // Create Officer profile
  await prisma.officer.upsert({
    where: { badgeNo: 'SLP001' },
    update: {},
    create: {
      userId: officerUser.id,
      badgeNo: 'SLP001',
      phone: '+94771234567',
      districtId: colombo.id,
    },
  });
  console.log('✅ Officer user seeded: officer@trafficfines.lk / Officer@123');

  console.log('✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
