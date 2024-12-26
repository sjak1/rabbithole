"use client";
import { useState } from "react";
import getCompletion from "./openai";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { ChatInput } from "@/components/ChatInput";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";


interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [branchId] = useState(uuidv4());

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const completion = await getCompletion({
      messages: [...messages, { role: 'user', content: message }]
    });
    const aiMessage = completion.choices[0].message.content ?? "No response";

    // Add both messages in a single update
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: aiMessage }
    ]);

    setMessage("");
  }

  function handleBranchOut() {
    router.push(`/branch/${branchId}`);
  }


  return (
    <div className="h-screen flex flex-col p-4">
      <div className="flex-1 mb-4">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <Card className={`max-w-[80%] p-3 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </Card>
            </div>
          ))}
        </div>
      </div>
      <div className="sticky">
        <ChatInput
          message={message}
          setMessage={setMessage}
          onSubmit={handleSubmit}
          onBranchOut={handleBranchOut}
        />
      </div>
    </div>
  );
}
