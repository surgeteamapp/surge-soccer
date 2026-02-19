const { PrismaClient } = require('@prisma/client');

// Test different connection strings
const connectionStrings = [
  process.env.DATABASE_URL,
  'postgresql://postgres:KZYOfVEclAKAzikQ@db.ssbktnwwybjzaqxujoai.supabase.co:5432/postgres',
  'postgresql://postgres:KZYOfVEclAKAzikQ@db.ssbktnwwybjzaqxujoai.supabase.co:5432/postgres?sslmode=require',
  'postgres://postgres:KZYOfVEclAKAzikQ@db.ssbktnwwybjzaqxujoai.supabase.co:5432/postgres'
];

async function testConnections() {
  console.log('Testing database connections...\n');
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const connectionString = connectionStrings[i];
    console.log(`\n=== Test ${i + 1} ===`);
    console.log('Connection string:', connectionString.substring(0, 50) + '...');
    
    try {
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: connectionString
          }
        },
        log: ['error', 'warn']
      });
      
      await prisma.$connect();
      console.log('✅ SUCCESS: Connected successfully');
      
      // Test a simple query
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ SUCCESS: Query executed successfully');
      
      await prisma.$disconnect();
      break; // Stop on first successful connection
      
    } catch (error) {
      console.log('❌ FAILED:', error.message);
    }
  }
}

testConnections().catch(console.error);
