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
    console.log('Starting title generation for messages:', messages.slice(0, 2));
    // Only use the first message and response
    const relevantMessages = messages.slice(0, 2);

    console.log('Calling OpenAI API...');
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

    const title = completion.choices[0].message.content?.toLowerCase().trim() || "untitled-branch";
    console.log('Successfully generated title:', title);
    return title;
  } catch (error) {
    console.error('Detailed error in OpenAI title generation:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      messages: messages.slice(0, 2)
    });
    return "untitled-branch";
  }
}

