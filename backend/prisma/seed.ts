import { PrismaClient } from "../src/generated/prisma";
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Clearing old data...');
  await prisma.branch.deleteMany();
  await prisma.user.deleteMany();

  console.log('👤 Creating users...');
  const users = await Promise.all(
    Array.from({ length: 3 }).map((_, i) =>
      prisma.user.create({
        data: {
          email: `user${i}@example.com`,
          name: `User ${i}`,
        },
      })
    )
  );

  console.log('🌿 Creating branches and sub-branches...');
  for (const user of users) {
    for (let j = 0; j < 2; j++) {
      // Top-level branch
      const parentBranch = await prisma.branch.create({
        data: {
          name: `${user.name}'s Branch ${j + 1}`,
          userId: user.id,
          messages: [
            {
              role: 'user',
              content: `Hello from ${user.name}'s top-level branch ${j + 1}`,
            },
          ],
        },
      });

      // Sub-branches
      for (let k = 0; k < 2; k++) {
        await prisma.branch.create({
          data: {
            name: `${user.name}'s Branch ${j + 1}.${k + 1}`,
            userId: user.id,
            parentId: parentBranch.id,
            messages: [
              {
                role: 'user',
                content: `This is a reply from sub-branch ${j + 1}.${k + 1}`,
              },
            ],
          },
        });
      }
    }
  }

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

