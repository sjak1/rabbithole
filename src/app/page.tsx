"use client";
import { useState, useEffect, useRef } from "react";
import { ChatInput } from "@/components/ChatInput";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { Message, getLLMResponse, generateTitle } from "@/api";
import { ChatMessage } from "@/components/ChatMessage";
import { useUser, useAuth } from "@clerk/nextjs";
import { RabbitIcon } from "lucide-react";

export default function Home() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { getMessagesForBranch, addMessageToBranch, getBranchParent, createBranch, setCredits, setBranchTitle } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [parentMessages, setParentMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [branchId] = useState(uuidv4());
  const branchCreatedRef = useRef(false);

  const router = useRouter();
  useEffect(() => {
   const loadParents = async () => {
     const token = await getToken();
     if (!token) return;
     
     // Only try to get parent if branch exists (after first message)
     if (branchCreatedRef.current) {
       const parentId = await getBranchParent(branchId, token);
       if (parentId) {
         const fetchedParentMessages = await getMessagesForBranch(parentId, token);
         setParentMessages(fetchedParentMessages);
       }
     }
   };
   loadParents();
  }, [branchId, getMessagesForBranch, getBranchParent, getToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const token = await getToken();
    if (!token) return;

    // Lazily create the branch on first user message to avoid empty branches in DB
    if (!branchCreatedRef.current) {
      await createBranch(branchId, "New Branch", token);
      branchCreatedRef.current = true;
    }

    const newMessage = { role: 'user' as const, content: message };

    // Let backend handle adding to array, get updated messages back
    const updatedMessages = await addMessageToBranch(branchId, newMessage, token);
    setMessages(updatedMessages);
    setMessage("");
    setIsLoading(true);
    setStreamingMessage("");

    setTimeout(async () => {
      try {
        const { content, credits } = await getLLMResponse(
          [...parentMessages, ...updatedMessages],
          token,
          (streamContent: string) => {
            setStreamingMessage(streamContent);
          }
        );
        setCredits(credits);
        setStreamingMessage("");

        const aiMessage = {
          role: 'assistant' as const,
          content
        };

        // Add AI response the same way
        const finalMessages = await addMessageToBranch(branchId, aiMessage, token);
        setMessages(finalMessages);
        setIsLoading(false);

        // Generate title after the first exchange
        if (finalMessages.length === 2) {
          const { title, credits: remainingCredits } = await generateTitle(branchId, token);
          await setBranchTitle(branchId, title, token);
          setCredits(remainingCredits);
        }

        if (window.location.pathname === '/') {
          router.push(`/branch/${branchId}`);
        }
      } catch (error) {
        console.error('Error getting LLM response:', error);
        setIsLoading(false);
        setStreamingMessage("");
      }
    }, 0);  
  };

  // Show centered welcome screen if no messages yet
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-8 max-w-2xl mx-auto px-4">
          {/* Big Logo */}
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 flex items-center justify-center bg-zinc-900 rounded-2xl shadow-lg">
              <RabbitIcon className="w-12 h-12 text-white" />
            </div>
          </div>
          
          {/* Greeting */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-zinc-900">
              Hey {user?.firstName || 'there'}, what would you like to explore today?
            </h1>
            <p className="text-lg text-zinc-600">
              Start a conversation and dive down the rabbit hole of possibilities
            </p>
          </div>
          
          {/* Input Box - positioned right after the paragraph */}
          <div className="w-full max-w-2xl">
            <div className="relative">
              <form 
                onSubmit={handleSubmit}
                className="flex items-center bg-white border border-zinc-200 rounded-full shadow-xl p-2"
              >
                <input
                  type="text"
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-base placeholder:text-zinc-500 px-4 py-2"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                />
                <button
                  type="submit"
                  className="rounded-full h-10 w-10 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors flex items-center justify-center disabled:opacity-50"
                  disabled={!message.trim()}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show conversation view if messages exist
  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="flex-1 space-y-4 pb-36">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {streamingMessage && (
            <ChatMessage
              message={{ role: 'assistant', content: streamingMessage }}
            />
          )}
          {isLoading && !streamingMessage && (
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
