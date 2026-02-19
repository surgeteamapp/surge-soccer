import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'coxjuston04@gmail.com';
  const testPassword = 'Call317470admin';
  
  console.log('Checking user:', email);
  
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    console.log('❌ User NOT found in database!');
    
    // List all users
    const allUsers = await prisma.user.findMany({
      select: { email: true, firstName: true, lastName: true }
    });
    console.log('\nExisting users:');
    allUsers.forEach(u => console.log(`  - ${u.email} (${u.firstName} ${u.lastName})`));
    return;
  }
  
  console.log('✅ User found:', user.firstName, user.lastName);
  console.log('   Role:', user.role);
  console.log('   Has password:', user.password ? 'YES' : 'NO');
  
  if (user.password) {
    const isValid = await compare(testPassword, user.password);
    console.log('   Password check:', isValid ? '✅ VALID' : '❌ INVALID');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
