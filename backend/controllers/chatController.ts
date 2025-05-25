import { PrismaClient } from "../src/generated/prisma";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getMessagesForBranch = async (req: Request, res: Response) => {
  const branchId = req.params.branchId;

  try {
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { messages: true }
    });

    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }

    res.json(branch.messages ?? []);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const appendMessageToBranch = async (req: Request, res: Response) => {
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
    }
};

export const setBranchParent = async (req: Request, res: Response) => {
    const { childId, parentId } = req.body;
    const updatedBranch = await prisma.branch.update({
        where: { id: childId },
        data: { parentId: parentId }
    })
    res.json(updatedBranch);
}

export const getBranchParent = async (req: Request, res: Response) => {
    const branchId = req.params.branchId;
    const branch = await prisma.branch.findUnique({
        where: { id: branchId },
        include: { parent: true }
    })
    res.json(branch?.parent);
}

export const deleteBranch = async(req:Request, res:Response) => {
    const branchId = req.params.branchId
    const deleteBranch = await prisma.branch.delete({
      where: {
        id : branchId
    } 
  })
  res.json(deleteBranch)
}

export const setBranchTitle = async (req: Request, res: Response) => {
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
    }
};

export const createBranch = async (req: Request, res: Response) => {
    try {
        const { branchId, name = "New Branch" } = req.body;
        const branch = await prisma.branch.create({
            data: {
                id: branchId,
                name,
                user: {
                    connect: { id: "default-user" } 
                }
            }
        });
        res.json(branch);
    } catch (err) {
        console.error('Error creating branch:', err);
        res.status(500).json({ error: 'Failed to create branch' });
    }
}; 
