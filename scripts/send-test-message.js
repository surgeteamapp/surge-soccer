const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get a chat room with participants
  const room = await prisma.chatRoom.findFirst({
    include: { participants: true }
  });
  
  if (!room) {
    console.log('No chat rooms found');
    return;
  }
  
  console.log('Room ID:', room.id);
  console.log('Room Name:', room.name);
  
  // Get users - we need to send from someone other than you
  const users = await prisma.user.findMany({ take: 5 });
  console.log('Users found:', users.length);
  
  // Find a user that's not the main admin
  const sender = users.find(u => u.email !== 'coxjuston04@gmail.com') || users[0];
  
  console.log('Sender:', sender.firstName, sender.lastName);
  
  // Create a test message
  const message = await prisma.message.create({
    data: {
      content: '🔔 Test notification! Did you see the badge update on the chat icon?',
      senderId: sender.id,
      chatRoomId: room.id,
      readBy: [sender.id],
      mentions: [],
    }
  });
  
  console.log('✅ Message sent! ID:', message.id);
  console.log('Check your chat icon for the notification badge.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
