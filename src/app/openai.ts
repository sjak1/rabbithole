import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
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

export const getBranchTitle = async (messages: Message[]) => {
  try {
    // Only use the first message and response
    const relevantMessages = messages.slice(0, 2);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Generate a short, descriptive git branch title based on the conversation. Use hyphens instead of spaces, lowercase letters, and avoid special characters. The title should be 2-5 words maximum. Respond only with the title, no explanation."
        },
        ...relevantMessages,
      ],
    });

    return completion.choices[0].message.content?.toLowerCase().trim() || "untitled-branch";
  } catch (error) {
    console.error('Error generating branch title:', error);
    return "untitled-branch";
  }
}

