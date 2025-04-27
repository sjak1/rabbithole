import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {

    const user = await prisma.user.create({
        data: {
            email: "ak@gmail.com",
            name: "Ak"
        }
    })

    console.log(user);

    const branch = await prisma.branch.create({
        data: {
            id: "1",
            name: "Branch 1",
            userId: user.id
        }
    })

    console.log(branch);

    const message = await prisma.message.create({
        data: {
            content: "Hello, world!",
            branchId: branch.id,
            role: "user",
            userId: user.id
        }
    })

    console.log(message);
    
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });