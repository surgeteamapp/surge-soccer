import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Reset super admin password
  const password = await hash('Call317470admin', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'coxjuston04@gmail.com' },
    update: {
      password: password,
    },
    create: {
      email: 'coxjuston04@gmail.com',
      password: password,
      firstName: 'Juston',
      lastName: 'Cox',
      role: 'ADMIN',
    },
  });
  
  console.log('✅ Password reset successfully for:', user.email);
  console.log('You can now login with: coxjuston04@gmail.com / Call317470admin');
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
