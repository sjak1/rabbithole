import { PrismaClient } from "../src/generated/prisma";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getMessagesForBranch = async (req: Request, res: Response) => {
    const branchId = req.params.branchId;
    const messages = await prisma.message.findMany({
        where: {
            branchId: branchId
        }
    })
    res.json(messages);
}

export const setMessagesForBranch = async (req: Request, res: Response) => {
    const branchId = req.params.branchId;
    const messages = req.body.messages;
    const updatedMessages = await prisma.message.updateMany({
        where: { branchId: branchId },
        data: { content: messages }
    })
    res.json(updatedMessages);
}

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
