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