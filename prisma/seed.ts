import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create Super Admin User (with role switching capability)
  const superAdminPassword = await hash('Call317470admin', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'coxjuston04@gmail.com' },
    update: {
      password: superAdminPassword,
    },
    create: {
      email: 'coxjuston04@gmail.com',
      password: superAdminPassword,
      firstName: 'Juston',
      lastName: 'Cox',
      role: 'ADMIN',
    },
  });
  console.log('✓ Created super admin user (coxjuston04@gmail.com)');

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
    },
  });
  console.log('✓ Created admin user');

  // Create Coach Users
  const coachPassword = await hash('coach123', 10);
  const coach1 = await prisma.user.upsert({
    where: { email: 'coach.smith@surgesoccer.com' },
    update: {},
    create: {
      email: 'coach.smith@surgesoccer.com',
      password: coachPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: 'COACH',
    },
  });

  const coach2 = await prisma.user.upsert({
    where: { email: 'coach.johnson@surgesoccer.com' },
    update: {},
    create: {
      email: 'coach.johnson@surgesoccer.com',
      password: coachPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'COACH',
    },
  });
  console.log('✓ Created coach users');

  // Create Player Users
  const playerPassword = await hash('player123', 10);
  const players = [];
  
  const playerData = [
    { firstName: 'Michael', lastName: 'Stevens', email: 'michael.stevens@surgesoccer.com', number: 5 },
    { firstName: 'Emma', lastName: 'Rodriguez', email: 'emma.rodriguez@surgesoccer.com', number: 10 },
    { firstName: 'David', lastName: 'Clark', email: 'david.clark@surgesoccer.com', number: 8 },
    { firstName: 'Sophia', lastName: 'Martinez', email: 'sophia.martinez@surgesoccer.com', number: 15 },
    { firstName: 'James', lastName: 'Wilson', email: 'james.wilson@surgesoccer.com', number: 7 },
    { firstName: 'Olivia', lastName: 'Brown', email: 'olivia.brown@surgesoccer.com', number: 11 },
    { firstName: 'Liam', lastName: 'Davis', email: 'liam.davis@surgesoccer.com', number: 3 },
    { firstName: 'Ava', lastName: 'Garcia', email: 'ava.garcia@surgesoccer.com', number: 9 },
  ];

  for (const player of playerData) {
    const user = await prisma.user.upsert({
      where: { email: player.email },
      update: {},
      create: {
        email: player.email,
        password: playerPassword,
        firstName: player.firstName,
        lastName: player.lastName,
        role: 'PLAYER',
      },
    });
    players.push(user);
  }
  console.log(`✓ Created ${players.length} player users`);

  // Create Equipment Manager
  const equipmentPassword = await hash('equipment123', 10);
  const equipmentManager = await prisma.user.upsert({
    where: { email: 'equipment@surgesoccer.com' },
    update: {},
    create: {
      email: 'equipment@surgesoccer.com',
      password: equipmentPassword,
      firstName: 'Robert',
      lastName: 'Thompson',
      role: 'EQUIPMENT_MANAGER',
    },
  });
  console.log('✓ Created equipment manager user');

  // Create Sample Teams first (required for Play model)
  const team1 = await prisma.team.create({
    data: {
      name: 'Surge Soccer Academy',
      primaryColor: '#FF0000',
      secondaryColor: '#FFFFFF',
    },
  });

  // Create Sample Plays
  const play1 = await prisma.play.create({
    data: {
      name: 'Triangle Offense',
      description: 'A three-player offensive formation focusing on quick passes',
      teamId: team1.id,
      category: 'OFFENSIVE',
      tags: ['offense', 'triangle'],
      positionData: {
        players: [
          { id: '1', position: 'Forward', x: 50, y: 20 },
          { id: '2', position: 'Wing', x: 30, y: 40 },
          { id: '3', position: 'Wing', x: 70, y: 40 },
        ],
      },
      createdById: coach1.id,
    },
  });

  const play2 = await prisma.play.create({
    data: {
      name: 'Zone Defense',
      description: 'Defensive positioning in key zones',
      teamId: team1.id,
      category: 'DEFENSIVE',
      tags: ['defense', 'zone'],
      positionData: {
        players: [
          { id: '1', position: 'Center Back', x: 50, y: 80 },
          { id: '2', position: 'Left Back', x: 30, y: 70 },
          { id: '3', position: 'Right Back', x: 70, y: 70 },
        ],
      },
      createdById: coach2.id,
    },
  });
  console.log('✓ Created sample plays');

  // Create Sample Training Tasks
  const trainingTasks = await Promise.all([
    prisma.trainingTask.create({
      data: {
        title: 'Master Triangle Offense',
        description: 'Practice the Triangle Offense play until you can execute all movements correctly.',
        category: 'Play Execution',
        assignedById: coach1.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        difficulty: 'INTERMEDIATE',
        linkedPlayId: play1.id,
      },
    }),
    prisma.trainingTask.create({
      data: {
        title: 'Ball Control Drills',
        description: 'Complete 30 minutes of ball control exercises focusing on precision.',
        category: 'Ball Control',
        assignedById: coach1.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        difficulty: 'BEGINNER',
      },
    }),
    prisma.trainingTask.create({
      data: {
        title: 'Zone Defense Practice',
        description: 'Study and practice the Zone Defense play with your team.',
        category: 'Positioning',
        assignedById: coach2.id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        difficulty: 'BEGINNER',
        linkedPlayId: play2.id,
      },
    }),
  ]);
  console.log('✓ Created sample training tasks');

  // Assign training tasks to players
  for (const task of trainingTasks) {
    // Assign to first 3 players
    for (let i = 0; i < 3; i++) {
      await prisma.trainingProgress.create({
        data: {
          userId: players[i].id,
          taskId: task.id,
          status: i === 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
          progress: i === 0 ? 45 : 0,
        },
      });
    }
  }
  console.log('✓ Assigned training tasks to players');

  // Note: Sample videos removed - videos should only be created by users

  // Create Sample Events
  const now = new Date();
  const events = await Promise.all([
    prisma.event.create({
      data: {
        teamId: team1.id,
        title: 'Team Practice',
        description: 'Regular team practice session',
        startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        location: 'Main Field',
      },
    }),
    prisma.event.create({
      data: {
        teamId: team1.id,
        title: 'Home Game vs Thunder',
        description: 'League game against Thunder team',
        startTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
        location: 'Home Arena',
      },
    }),
  ]);
  console.log('✓ Created sample schedule events');

  console.log('\n✅ Database seeded successfully!\n');
  console.log('Test credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:     admin@surgesoccer.com / admin123');
  console.log('Coach 1:   coach.smith@surgesoccer.com / coach123');
  console.log('Coach 2:   coach.johnson@surgesoccer.com / coach123');
  console.log('Player:    michael.stevens@surgesoccer.com / player123');
  console.log('Equipment: equipment@surgesoccer.com / equipment123');
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
