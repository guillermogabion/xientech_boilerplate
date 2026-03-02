const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('superadmin123', 10);

  // Use upsert to avoid duplicate errors if you run this twice
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@system.com' },
    update: {},
    create: {
      username: 'super_admin',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      email: 'gabionguillermo@gmail.com',
      role: 'SUPER_ADMIN',
      // If your schema requires an org, create a dummy one first
      // organizationId: 1 
    },
  });

  console.log('Seed complete: Created Super Admin', superAdmin.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });