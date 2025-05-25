"use client";
import { useState, useEffect } from "react";
import getCompletion from "@/app/openai";
import { ChatInput } from "@/components/ChatInput";
import { v4 as uuidv4 } from 'uuid';
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import ReactMarkdown from "react-markdown";
import { Message } from "@/api";

export default function Home() {
    const { getMessagesForBranch, setMessagesForBranch, setBranchParent, getBranchParent, deleteBranch, createBranch } = useStore();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [parentMessages, setParentMessages] = useState<Message[]>([]);
    const params = useParams();
    const branchId = params?.id as string;
    const router = useRouter();

    useEffect(() => {
        const loadMessages = async () => {
            const fetchedMessages = await getMessagesForBranch(branchId);
            setMessages(fetchedMessages);

            const parentId = await getBranchParent(branchId);
            if (parentId) {
                const fetchedParentMessages = await getMessagesForBranch(parentId);
                setParentMessages(fetchedParentMessages);
            }
        };
        loadMessages();
    }, [branchId, getMessagesForBranch, getBranchParent]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!message.trim()) return;

        const updatedMessages = [...messages, { role: 'user' as const, content: message }];
        await setMessagesForBranch(branchId, updatedMessages);
        setMessages(updatedMessages);
        setMessage("");

        setTimeout(async () => {
            const completion = await getCompletion({
                messages: [...parentMessages, ...updatedMessages]
            });
            const aiMessage = completion.choices[0].message.content ?? "No response";
            const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: aiMessage }];
            await setMessagesForBranch(branchId, finalMessages);
            setMessages(finalMessages);
        }, 0);
    }

    async function handleBranchOut() {
        const newBranchId = uuidv4();
        await createBranch(newBranchId);
        await setMessagesForBranch(branchId, messages);
        await setBranchParent(newBranchId, branchId);
        router.push(`/branch/${newBranchId}`);
    }

    async function handleDeleteBranch() {
        await deleteBranch(branchId);
        router.push('/');
    }

    return (
        <div className="flex flex-col p-4 max-w-4xl mx-auto">
            <div className="flex-1 mb-4 pb-36">
                <div className="space-y-8">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-2 h-2 mb-4 rounded-full bg-zinc-300 transition-all duration-200 group-hover:bg-zinc-400" />
                            )}

                            <div
                                className={`
                                    group flex flex-col max-w-[80%] 
                                    ${msg.role === 'user' ? 'items-end' : 'items-start'}
                                `}
                            >
                                <div
                                    className={`
                                        relative px-5 py-3 rounded-md
                                        ${msg.role === 'user'
                                            ? 'bg-zinc-900 text-zinc-50'
                                            : 'bg-zinc-50 border-l-2 border-zinc-200'
                                        }
                                        shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]
                                        hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.12)]
                                        transition-all duration-200 ease-in-out
                                        hover:translate-x-[-1px] hover:translate-y-[-1px]
                                    `}
                                >
                                    <div className="whitespace-pre-wrap">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-2 h-2 mb-4 rounded-full bg-zinc-400 transition-all duration-200 group-hover:bg-zinc-600" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-zinc-50/90 backdrop-blur-sm border-t border-zinc-200 py-4">
                <div className="max-w-4xl mx-auto px-4">
                    <ChatInput
                        message={message}
                        setMessage={setMessage}
                        onSubmit={handleSubmit}
                        onBranchOut={handleBranchOut}
                        deleteBranch={handleDeleteBranch}
                    />
                </div>
            </div>
        </div>
    );
}
