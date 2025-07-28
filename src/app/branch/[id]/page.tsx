"use client";
import { useState, useEffect } from "react";
import { ChatInput } from "@/components/ChatInput";
import { v4 as uuidv4 } from 'uuid';
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { Message, getLLMResponse, generateTitle } from "@/api";
import { ChatMessage } from "@/components/ChatMessage";
import { useAuth } from "@clerk/nextjs";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function BranchPage() {
    const { getToken } = useAuth();

    const getMessagesForBranch = useStore(s => s.getMessagesForBranch);
    const addMessageToBranch = useStore(s => s.addMessageToBranch);
    const setBranchParent = useStore(s => s.setBranchParent);
    const getBranchParent = useStore(s => s.getBranchParent);
    const deleteBranch = useStore(s => s.deleteBranch);
    const createBranch = useStore(s => s.createBranch);
    const setCredits = useStore(s => s.setCredits);
    const setBranchTitle = useStore(s => s.setBranchTitle);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [parentMessages, setParentMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState("");
    const [isSkeleton, setIsSkeleton] = useState(false);
    const params = useParams();
    const branchId = params?.id as string;
    const router = useRouter();

    useEffect(() => {
        setIsSkeleton(true);
        const loadMessages = async () => {
            const token = await getToken();
            if (!token) return;
            
            const fetchedMessages = await getMessagesForBranch(branchId, token);
            const parentId = await getBranchParent(branchId, token);
            let fetchedParentMessages: Message[] = [];
            
            if (parentId) {
                fetchedParentMessages = await getMessagesForBranch(parentId, token);
            }
            
            // Set all data at once, then hide skeleton
            setMessages(fetchedMessages);
            setParentMessages(fetchedParentMessages);
            setTimeout(() => {
                setIsSkeleton(false);
            },2000);
        };
        loadMessages();
    }, [branchId, getMessagesForBranch, getBranchParent, getToken]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!message.trim()) return;

        const token = await getToken();
        if (!token) return;

        const newMessage = { role: 'user' as const, content: message };
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

                const finalMessages = await addMessageToBranch(branchId, aiMessage, token);
                setMessages(finalMessages);
                setIsLoading(false);

                // Generate title after the first exchange
                if (finalMessages.length === 2) {
                    const { title, credits: remainingCredits } = await generateTitle(branchId, token);
                    await setBranchTitle(branchId, title, token);
                    setCredits(remainingCredits);
                }
            } catch (error) {
                console.error('Error getting LLM response:', error);
                setIsLoading(false);
                setStreamingMessage("");
            }
        }, 0);
    }

    async function handleBranchOut() {
        const token = await getToken();
        if (!token) return;
        
        const newBranchId = uuidv4();
        await createBranch(newBranchId, "New Branch", token);
        await setBranchParent(newBranchId, branchId, token);
        router.push(`/branch/${newBranchId}`);
    }

    async function handleDeleteBranch() {
        const token = await getToken();
        if (!token) return;
        
        await deleteBranch(branchId, token);
        router.push('/');
    }

    return (
        <>  
            {isSkeleton ? (
                <div className="max-w-[35rem] mx-auto">
                    {Array.from({length: 10}).map((_, index) => (
                        index % 2 === 0 ? (
                            <div className="" key={index}>
                                <Skeleton height={50} width="50%" />
                            </div>
                        ) : (
                            <div className="mt-10" key={index}>
                                <Skeleton height={50} width="70%" />
                            </div>
                        )
                    ))}
                </div>
            ) : (
                <div className="max-w-[49rem] mx-auto">
                    <div className="flex-1 space-y-8 pb-36">
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
            )}
            <ChatInput
                message={message}
                setMessage={setMessage}
                onSubmit={handleSubmit}
                onBranchOut={handleBranchOut}
                deleteBranch={handleDeleteBranch}
            />
        </>
    );
}
