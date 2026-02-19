import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create a team first
  const team = await prisma.team.upsert({
    where: { id: 'default-team' },
    update: {},
    create: {
      id: 'default-team',
      name: 'Surge Soccer Team',
      logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=SurgeSoccer',
    },
  });
  console.log('✓ Created team');

  // Create Admin User
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@surgesoccer.com' },
    update: {},
    create: {
      email: 'admin@surgesoccer.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
  });
  console.log('✓ Created admin user');

  // Create Coach User with Coach profile
  const coachPassword = await hash('coach123', 10);
  const coach1User = await prisma.user.upsert({
    where: { email: 'coach.smith@surgesoccer.com' },
    update: {},
    create: {
      email: 'coach.smith@surgesoccer.com',
      password: coachPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: 'COACH',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnSmith',
      coach: {
        create: {
          specialization: 'Offensive Strategy',
          certification: 'USPTA Certified',
        },
      },
    },
  });
  console.log('✓ Created coach user');

  // Create Player User with Player profile
  const playerPassword = await hash('player123', 10);
  const player1User = await prisma.user.upsert({
    where: { email: 'michael.stevens@surgesoccer.com' },
    update: {},
    create: {
      email: 'michael.stevens@surgesoccer.com',
      password: playerPassword,
      firstName: 'Michael',
      lastName: 'Stevens',
      role: 'PLAYER',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MichaelStevens',
      player: {
        create: {
          jerseyNumber: 10,
          position: 'Forward',
          chairModel: 'Sport Chair Pro',
        },
      },
    },
  });
  console.log('✓ Created player user');

  // Create another player
  const player2User = await prisma.user.upsert({
    where: { email: 'sarah.martinez@surgesoccer.com' },
    update: {},
    create: {
      email: 'sarah.martinez@surgesoccer.com',
      password: playerPassword,
      firstName: 'Sarah',
      lastName: 'Martinez',
      role: 'PLAYER',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahMartinez',
      player: {
        create: {
          jerseyNumber: 7,
          position: 'Midfielder',
          chairModel: 'Sport Chair Pro',
        },
      },
    },
  });
  console.log('✓ Created second player user');

  // Create a Play
  const play1 = await prisma.play.create({
    data: {
      name: 'Triangle Offense',
      description: 'A coordinated offensive play using triangular positioning',
      category: 'OFFENSIVE',
      tags: ['offense', 'beginner'],
      positionData: {
        positions: [
          { player: 1, x: 100, y: 200 },
          { player: 2, x: 200, y: 150 },
          { player: 3, x: 200, y: 250 },
        ],
      },
      teamId: team.id,
      createdById: coach1User.id,
    },
  });
  console.log('✓ Created play');

  // Get player IDs
  const player1 = await prisma.player.findUnique({
    where: { userId: player1User.id },
  });
  const player2 = await prisma.player.findUnique({
    where: { userId: player2User.id },
  });

  if (!player1 || !player2) {
    throw new Error('Players not found');
  }

  // Create Training Tasks
  const task1 = await prisma.trainingTask.create({
    data: {
      title: 'Master Triangle Offense Play',
      description: 'Practice the Triangle Offense play until you can execute all movements correctly. Focus on positioning and timing.',
      category: 'Play Execution',
      difficulty: 'INTERMEDIATE',
      assignedById: coach1User.id,
      linkedPlayId: play1.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      progress: {
        create: [
          {
            userId: player1User.id,
            status: 'IN_PROGRESS',
            progress: 65,
          },
          {
            userId: player2User.id,
            status: 'NOT_STARTED',
            progress: 0,
          },
        ],
      },
    },
  });

  const task2 = await prisma.trainingTask.create({
    data: {
      title: 'Improve Ball Control Precision',
      description: 'Complete the ball control drill video and practice the techniques shown. Focus on maintaining control while moving.',
      category: 'Ball Control',
      difficulty: 'BEGINNER',
      assignedById: coach1User.id,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      progress: {
        create: [
          {
            userId: player1User.id,
            status: 'COMPLETED',
            progress: 100,
          },
        ],
      },
    },
  });

  const task3 = await prisma.trainingTask.create({
    data: {
      title: 'Weekly Fitness Challenge',
      description: 'Complete 30 minutes of cardio training daily for one week. Track your progress and note any improvements in endurance.',
      category: 'Fitness',
      difficulty: 'BEGINNER',
      assignedById: coach1User.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      progress: {
        create: [
          {
            userId: player1User.id,
            status: 'IN_PROGRESS',
            progress: 40,
          },
          {
            userId: player2User.id,
            status: 'IN_PROGRESS',
            progress: 25,
          },
        ],
      },
    },
  });

  console.log('✓ Created training tasks');

  console.log('\n✅ Database seeded successfully!\n');
  console.log('Test credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:     admin@surgesoccer.com / admin123');
  console.log('Coach:     coach.smith@surgesoccer.com / coach123');
  console.log('Player 1:  michael.stevens@surgesoccer.com / player123');
  console.log('Player 2:  sarah.martinez@surgesoccer.com / player123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch(e => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
