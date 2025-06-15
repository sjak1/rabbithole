import { PrismaClient, Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";

const prisma = new PrismaClient();

export const getMessagesForBranch = async (req: Request, res: Response): Promise<void> => {
  const branchId = req.params.branchId;

  try {
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { messages: true }
    });

    if (!branch) {
      res.status(404).json({ error: "Branch not found" });
      return;
    }

    res.json(branch.messages ?? []);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
    return;
  }
};

export const appendMessageToBranch = async (req: Request, res: Response): Promise<void> => {
    const branchId = req.params.branchId;
    const newMessage = req.body.message; // should be { role: 'user' | 'assistant' | 'system', content: '...' }

    try {
        const branch = await prisma.branch.findUnique({
            where: { id: branchId },
            select: { messages: true }
        });

        const currentMessages = Array.isArray(branch?.messages) ? branch.messages : [];

        const updatedMessages = [...currentMessages, newMessage];

        const updatedBranch = await prisma.branch.update({
            where: { id: branchId },
            data: { messages: updatedMessages }
        });

        res.json(updatedBranch.messages);
    } catch (err) {
        console.error('Failed to append message:', err);
        res.status(500).json({ error: 'Failed to append message' });
        return;
    }
};

export const setBranchParent = async (req: Request, res: Response): Promise<void> => {
    const { childId, parentId } = req.body;
    const updatedBranch = await prisma.branch.update({
        where: { id: childId },
        data: { parentId: parentId }
    })
    res.json(updatedBranch);
    return;
}

export const getBranchParent = async (req: Request, res: Response): Promise<void> => {
    const branchId = req.params.branchId;
    const branch = await prisma.branch.findUnique({
        where: { id: branchId },
        include: { parent: true }
    })
    res.json(branch?.parent);
    return;
}

export const deleteBranch = async(req:Request, res:Response): Promise<void> => {
    const branchId = req.params.branchId
    const deleteBranch = await prisma.branch.delete({
      where: {
        id : branchId
    } 
  })
  res.json(deleteBranch);
  return;
}

export const setBranchTitle = async (req: Request, res: Response): Promise<void> => {
    try {
        const { branchId } = req.params;
        const { title } = req.body;
        const updatedBranch = await prisma.branch.update({
            where: { id: branchId },
            data: { name: title }
        });
        res.json(updatedBranch);
    } catch (err) {
        console.error('Error setting branch title:', err);
        res.status(500).json({ error: 'Failed to set branch title' });
        return;
    }
};

export const createBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { branchId, name = 'New Branch' } = req.body;
    console.log('Attempting to create branch:', { branchId, name });

    // Get authenticated user
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ error: 'Not signed in' });
      return;
    }

    // Ensure user exists in local DB
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress || "";

    await prisma.user.upsert({
      where: { id: userId },
      update: { email },
      create: { id: userId, email }
    });

    const branch = await prisma.branch.create({
      data: {
        id: branchId,
        name,
        user: { connect: { id: userId } }
      }
    });
    res.json(branch);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error creating branch:', {
        message: err.message,
        code: err instanceof Prisma.PrismaClientKnownRequestError ? err.code : undefined,
        stack: err.stack
      });
    }
    res.status(500).json({ error: 'Failed to create branch' });
    return;
  }
};
