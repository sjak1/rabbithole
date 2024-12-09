"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import getCompletion from "./openai";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<Message | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const completion = await getCompletion({ messages: [...messages, { role: 'user', content: message }] });
    const aiMessage = completion.choices[0].message.content ?? "No response";
    setResponse({ role: 'assistant', content: aiMessage });
    setMessages((prevMessages) => [...prevMessages, { role: 'user', content: message }]);
    setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: aiMessage }]);
  }

  return (
    <>
      <ScrollArea className="flex-1 p-4">
        {messages.map((msg, index) => (
          <Card key={index} className={`mb-2 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <div>{msg.content}</div>
          </Card>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center justify-center">
          <Input type="text" className="w-full md:w-1/2" value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button type="submit" variant="outline">Send</Button>
        </div>
      </form>
    </>
  );
}
