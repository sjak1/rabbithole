import { PrismaClient, Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";

import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default async function getCompletion({ messages }: { messages: Message[] }) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      ...messages,
    ],
  });

  return completion;
}

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

export const generateBranchTitle = async (req: Request, res: Response): Promise<void> => {
    try {
        const { branchId } = req.params;
        const { userId } = getAuth(req);

        if (!userId) {
            res.status(401).json({ error: 'Not signed in' });
            return;
        }

        const branch = await prisma.branch.findUnique({
            where: { id: branchId },
            select: { messages: true }
        });

        if (!branch || !Array.isArray(branch.messages) || branch.messages.length === 0) {
            res.status(404).json({ error: "Branch not found or has no messages" });
            return;
        }

        // Take the first 4 messages to generate a title
        const messagesForTitle = (branch.messages as unknown as Message[]).slice(0, 4);

        const titlePrompt = {
            role: 'system' as const,
            content: "Summarize the following conversation in 5 words or less to be used as a title. Be concise and descriptive. Do not use quotes."
        };

        const response = await getCompletion({ messages: [titlePrompt, ...messagesForTitle] });

        const title = response.choices[0]?.message?.content?.trim().replace(/["']/g, "") ?? "New Title";

        // Deduct credits for title generation
        const costPerMillionInputTokens = 0.15;
        const costPerMillionOutputTokens = 0.60;
        const promptTokens = response.usage?.prompt_tokens ?? 0;
        const completionTokens = response.usage?.completion_tokens ?? 0;
        const cost = (promptTokens / 1_000_000) * costPerMillionInputTokens +
                     (completionTokens / 1_000_000) * costPerMillionOutputTokens;

        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: cost } },
        });

        const updatedBranch = await prisma.branch.update({
            where: { id: branchId },
            data: { name: title }
        });

        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true }
        });

        res.json({ updatedBranch, remainingCredits: updatedUser?.credits });

    } catch (err) {
        console.error('Error generating branch title:', err);
        res.status(500).json({ error: 'Failed to generate branch title' });
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

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: 'Not signed in' });
    return;
  }

  try {
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || "";

      user = await prisma.user.upsert({
        where: { id: userId },
        update: { email, name: clerkUser.firstName },
        create: { id: userId, email, name: clerkUser.firstName },
      });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const getBranchesForUser = async (req: Request, res: Response): Promise<void> => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: 'Not signed in' });
    return;
  }

  try {
    const branches = await prisma.branch.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        parentId: true,
        messages: true
      }
    });

    res.json(branches);
  } catch (err) {
    console.error('Error fetching branches:', err);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};

export const getLLMResponse = async (req: Request, res: Response): Promise<void> => {
  const { messages } = req.body;
  const { userId }   = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: 'Not signed in' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (user.credits <= 0) {
    res.status(403).json({ error: "Out of credits" });
    return;
  }

  try {
    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': process.env.CLIENT_ORIGIN || 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
    });

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        ...messages,
      ],
      stream: true,
    });

    let fullContent = '';
    let promptTokens = 0;
    let completionTokens = 0;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        res.write(`data: ${JSON.stringify({ content, type: 'content' })}\n\n`);
      }

      // Track usage if available
      if (chunk.usage) {
        promptTokens = chunk.usage.prompt_tokens || 0;
        completionTokens = chunk.usage.completion_tokens || 0;
      }
    }

    // Calculate cost and deduct credits
    const costPerMillionInputTokens = 0.15;
    const costPerMillionOutputTokens = 0.60;
    const cost = (promptTokens / 1_000_000) * costPerMillionInputTokens + 
                 (completionTokens / 1_000_000) * costPerMillionOutputTokens;

    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: cost },
      },
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });

    // Send final message with credits
    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      credits: updatedUser?.credits ?? 0,
      fullContent 
    })}\n\n`);
    
    res.end();

  } catch (err) {
    console.error("Error in getLLMResponse:", err);
    res.write(`data: ${JSON.stringify({ type: 'error', error: 'LLM failed' })}\n\n`);
    res.end();
  }
};
