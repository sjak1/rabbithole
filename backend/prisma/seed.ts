import { PrismaClient } from "../src/generated/prisma";
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    // Create a test user
    const user = await prisma.user.create({
        data: {
            email: "test@example.com",
            name: "Test User"
        }
    });

    // Create a root branch
    const rootBranch = await prisma.branch.create({
        data: {
            name: "Root Branch",
            userId: user.id
        }
    });

    // Create some messages in the root branch
    await prisma.message.createMany({
        data: [
            {
                content: "Hello, this is the root branch!",
                role: "user",
                branchId: rootBranch.id,
                userId: user.id
            },
            {
                content: "Yes, this is the main conversation.",
                role: "assistant",
                branchId: rootBranch.id,
                userId: user.id
            }
        ]
    });

    // Create a child branch
    const childBranch = await prisma.branch.create({
        data: {
            name: "Child Branch",
            userId: user.id,
            parentId: rootBranch.id
        }
    });

    // Create messages in the child branch
    await prisma.message.createMany({
        data: [
            {
                content: "This is a child branch conversation.",
                role: "user",
                branchId: childBranch.id,
                userId: user.id
            },
            {
                content: "Yes, branching out from the main conversation.",
                role: "assistant",
                branchId: childBranch.id,
                userId: user.id
            }
        ]
    });

    // Create a grandchild branch
    const grandchildBranch = await prisma.branch.create({
        data: {
            name: "Grandchild Branch",
            userId: user.id,
            parentId: childBranch.id
        }
    });

    // Create messages in the grandchild branch
    await prisma.message.createMany({
        data: [
            {
                content: "This is a grandchild branch!",
                role: "user",
                branchId: grandchildBranch.id,
                userId: user.id
            },
            {
                content: "Yes, branching out from the child branch.",
                role: "assistant",
                branchId: grandchildBranch.id,
                userId: user.id
            }
        ]
    });

    console.log("Seed completed successfully!");
    console.log("Created user:", user);
    console.log("Created branches:", { rootBranch, childBranch, grandchildBranch });
}

main()
    .catch((e) => {
        console.error("Error during seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });