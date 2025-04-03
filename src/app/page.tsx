"use client";
import { useState } from "react";
import getCompletion from "./openai";
import { ChatInput } from "@/components/ChatInput";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";


export default function Home() {

  const { getMessagesForBranch, setMessagesForBranch, setBranchParent, deleteBranch } = useStore();
  const messages = getMessagesForBranch('main');
  const [message, setMessage] = useState("");
  const [branchId] = useState(uuidv4());

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const updatedMessages = [...messages, { role: 'user' as const, content: message }];
    setMessagesForBranch(branchId, updatedMessages);

    // Force React to process the first update
    await Promise.resolve();

    const completion = await getCompletion({
      messages: updatedMessages
    });
    const aiMessage = completion.choices[0].message.content ?? "No response";

    setMessagesForBranch(branchId, [...updatedMessages, { role: 'assistant' as const, content: aiMessage }]);
    setMessage("");

    // Only navigate if we're on the main page (first message in a new branch)
    if (window.location.pathname === '/') {
      router.push(`/branch/${branchId}`);
    }
  }

  function handleBranchOut() {
    const newBranchId = uuidv4();
    setMessagesForBranch(branchId, messages);
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
                      {msg.content}
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