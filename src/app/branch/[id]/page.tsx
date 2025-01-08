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

    const { getMessagesForBranch, setMessagesForBranch, setBranchParent, getBranchParent } = useStore();
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
    }

    function handleBranchOut() {
        const newBranchId = uuidv4();
        setMessagesForBranch(branchId, messages);
        setBranchParent(newBranchId, branchId);
        router.push(`/branch/${newBranchId}`);
    }

    return (
        <div className="h-screen flex flex-col p-9">
            <div className="flex-1 mb-4 pb-36">
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
            <div className="fixed bottom-0 left-0 right-0 pb-4 pt-6 bg-white ">
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
