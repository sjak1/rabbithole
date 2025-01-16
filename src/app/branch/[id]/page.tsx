"use client";
import { useState } from "react";
import getCompletion from "@/app/openai";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { ChatInput } from "@/components/ChatInput";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/store";

export default function Home() {

    const { getMessagesForBranch, setMessagesForBranch, setBranchParent, getBranchParent, deleteBranch } = useStore();
    const [message, setMessage] = useState("");
    const params = useParams();
    const branchId = params?.id as string;

    const router = useRouter();

    const parentBranchId = getBranchParent(branchId);
    const parentMessages = parentBranchId ? getMessagesForBranch(parentBranchId) : [];
    const messages = getMessagesForBranch(branchId);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const completion = await getCompletion({
            messages: [...parentMessages, ...messages, { role: 'user', content: message }]
        });
        const aiMessage = completion.choices[0].message.content ?? "No response";

        setMessagesForBranch(branchId, [...messages, { role: 'user', content: message }, { role: 'assistant', content: aiMessage }]);
        setMessage("");
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
        <div className="flex flex-col p-4 max-w-4xl mx-auto">
            <div className="flex-1 mb-4 pb-36">
                <div className="space-y-6">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm">
                                    AI
                                </div>
                            )}

                            <div
                                className={`
                                    group flex flex-col max-w-[80%] 
                                    ${msg.role === 'user'
                                        ? 'items-end'
                                        : 'items-start'
                                    }
                                `}
                            >
                                <div
                                    className={`
                                        relative px-4 py-3 rounded-2xl shadow-sm
                                        ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none'
                                            : 'bg-white border border-gray-200 rounded-bl-none'
                                        }
                                    `}
                                >
                                    <div className="whitespace-pre-wrap">{msg.content}</div>

                                    {/* Message tail */}
                                    <div
                                        className={`
                                            absolute bottom-0 w-4 h-4 
                                            ${msg.role === 'user'
                                                ? 'right-0 bg-blue-600'
                                                : 'left-0 bg-white border-l border-b border-gray-200'
                                            }
                                            transform translate-y-[30%]
                                            ${msg.role === 'user'
                                                ? 'rounded-bl-2xl'
                                                : 'rounded-tr-2xl'
                                            }
                                        `}
                                    />
                                </div>

                                {/* Timestamp */}
                                <span className="text-xs text-gray-400 mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white text-sm">
                                    You
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-zinc-200 py-4">
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
