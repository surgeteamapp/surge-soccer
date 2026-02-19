import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'coxjuston04@gmail.com';
  const testPassword = 'Call317470admin';
  
  // Get the user
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user || !user.password) {
    console.log('User not found or no password');
    return;
  }
  
  console.log('Stored hash:', user.password);
  console.log('Hash length:', user.password.length);
  console.log('Hash starts with $2:', user.password.startsWith('$2'));
  
  // Test compare
  const isValid = await compare(testPassword, user.password);
  console.log('Compare result:', isValid);
  
  // Create a new hash and test
  const newHash = await hash(testPassword, 10);
  console.log('\nNew hash:', newHash);
  
  // Update with new hash
  await prisma.user.update({
    where: { email },
    data: { password: newHash }
  });
  
  console.log('\n✅ Password updated with fresh hash');
  
  // Verify
  const updatedUser = await prisma.user.findUnique({ where: { email } });
  const verifyResult = await compare(testPassword, updatedUser!.password!);
  console.log('Verify after update:', verifyResult);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
