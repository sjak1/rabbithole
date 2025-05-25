"use client";
import { useState, useEffect } from "react";
import getCompletion from "./openai";
import { ChatInput } from "@/components/ChatInput";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import ReactMarkdown from "react-markdown";
import { Message } from "@/api";

export default function Home() {

  const { getMessagesForBranch, setMessagesForBranch, setBranchParent, deleteBranch,createBranch } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [branchId] = useState(uuidv4());

  const router = useRouter();
  useEffect(() => {
   const setup = async () => {
     await createBranch(branchId); // Ensure it exists in DB
     const fetchedMessages = await getMessagesForBranch(branchId);
     setMessages(fetchedMessages);
   };
   setup();
  }, [branchId]);


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!message.trim()) return;

  const newMessage = { role: 'user' as const, content: message };

  await setMessagesForBranch(branchId, newMessage); // append user message
  const updatedMessages = [...messages, newMessage];
  setMessages(updatedMessages);
  setMessage("");

  setTimeout(async () => {
    const completion = await getCompletion({
      messages: updatedMessages, // ✅ full context
    });

    const aiMessage = {
      role: 'assistant' as const,
      content: completion.choices[0].message.content ?? "No response",
    };

    await setMessagesForBranch(branchId, aiMessage); // append assistant message
    setMessages((prev) => [...prev, aiMessage]);

    if (window.location.pathname === '/') {
      router.push(`/branch/${branchId}`);
    }
  }, 0);  
  };


  async function handleBranchOut() {
    const newBranchId = uuidv4();
    const currentMessages = await getMessagesForBranch(branchId);
    setMessagesForBranch(branchId, currentMessages);
    setBranchParent(newBranchId, branchId);
    router.push(`/branch/${newBranchId}`);
  }

  async function handleDeleteBranch() {
    await deleteBranch(branchId);
    router.push('/');
  }

  return (
    <>
      <div className="flex flex-col p-4">
        <div className="flex-1 mb-4">
          <div className="space-y-4">
            {messages.map((msg, index) => {
              return (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <div >
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 pb-4 pt-6">
          <ChatInput
            message={message}
            setMessage={setMessage}
            onSubmit={handleSubmit}
            onBranchOut={handleBranchOut}
            deleteBranch={handleDeleteBranch}
          />
        </div>
      </div>
    </>
  );
}
