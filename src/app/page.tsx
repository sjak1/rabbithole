"use client";
import { useState, useEffect, useRef } from "react";
import { ChatInput } from "@/components/ChatInput";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { Message, getLLMResponse, generateTitle } from "@/api";
import { ChatMessage } from "@/components/ChatMessage";

export default function Home() {

  const { getMessagesForBranch, addMessageToBranch, getBranchParent, createBranch, setCredits, setBranchTitle } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [parentMessages, setParentMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [branchId] = useState(uuidv4());
  const branchCreatedRef = useRef(false);

  const router = useRouter();
  useEffect(() => {
   const loadParents = async () => {
     // Only try to get parent if branch exists (after first message)
     if (branchCreatedRef.current) {
       const parentId = await getBranchParent(branchId);
       if (parentId) {
         const fetchedParentMessages = await getMessagesForBranch(parentId);
         setParentMessages(fetchedParentMessages);
       }
     }
   };
   loadParents();
  }, [branchId, getMessagesForBranch, getBranchParent]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Lazily create the branch on first user message to avoid empty branches in DB
    if (!branchCreatedRef.current) {
      await createBranch(branchId);
      branchCreatedRef.current = true;
    }

    const newMessage = { role: 'user' as const, content: message };

    // Let backend handle adding to array, get updated messages back
    const updatedMessages = await addMessageToBranch(branchId, newMessage);
    setMessages(updatedMessages);
    setMessage("");
    setIsLoading(true);

    setTimeout(async () => {
      const { content, credits }= await getLLMResponse([...parentMessages, ...updatedMessages]);
      setCredits(credits);

      const aiMessage = {
        role: 'assistant' as const,
        content
      };

      // Add AI response the same way
      const finalMessages = await addMessageToBranch(branchId, aiMessage);
      setMessages(finalMessages);
      setIsLoading(false);

      // Generate title after the first exchange
      if (finalMessages.length === 2) {
        const { title, credits: remainingCredits } = await generateTitle(branchId);
        await setBranchTitle(branchId, title);
        setCredits(remainingCredits);
      }

      if (window.location.pathname === '/') {
        router.push(`/branch/${branchId}`);
      }
    }, 0);  
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="flex-1 space-y-4 pb-36">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {isLoading && (
            <div className="flex items-end gap-3 justify-start">
              <div className="w-2 h-2 mb-4 rounded-full bg-zinc-300" />
              <div className="group flex flex-col items-start w-full">
                <div className="relative px-5 py-3 rounded-md bg-zinc-50 border-l-2 border-zinc-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ChatInput
          message={message}
          setMessage={setMessage}
          onSubmit={handleSubmit}
      />
    </>
  );
}
