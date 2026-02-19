import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding super admin user...');

  const password = await hash('Call317470admin', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'coxjuston04@gmail.com' },
    update: {
      password: password,
      role: 'ADMIN',
    },
    create: {
      email: 'coxjuston04@gmail.com',
      password: password,
      firstName: 'Juston',
      lastName: 'Cox',
      role: 'ADMIN',
    },
  });

  console.log('✓ Super admin user created/updated:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
