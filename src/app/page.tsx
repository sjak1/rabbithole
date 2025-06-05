"use client";
import { useState, useEffect, useRef } from "react";
import getCompletion from "./openai";
import { ChatInput } from "@/components/ChatInput";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import ReactMarkdown from "react-markdown";
import { Message } from "@/api";

export default function Home() {

  const { getMessagesForBranch, addMessageToBranch, setBranchParent, getBranchParent, deleteBranch,createBranch } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [parentMessages, setParentMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
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

    setTimeout(async () => {
      const completion = await getCompletion({
        messages: [...parentMessages, ...updatedMessages], // ✅ Full context including parent
      });

      const aiMessage = {
        role: 'assistant' as const,
        content: completion.choices[0].message.content ?? "No response",
      };

      // Add AI response the same way
      const finalMessages = await addMessageToBranch(branchId, aiMessage);
      setMessages(finalMessages);

      if (window.location.pathname === '/') {
        router.push(`/branch/${branchId}`);
      }
    }, 0);  
  };


  async function handleBranchOut() {
    const newBranchId = uuidv4();
    await createBranch(newBranchId);
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
