
import { Button } from "@/components/ui/button";
import { SendHorizonal, GitFork, Trash2 } from 'lucide-react';
import ChatInputContainer from "./ChatInputContainer";

interface ChatInputProps {
    message: string;
    setMessage: (message: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onBranchOut?: () => void;
    deleteBranch?: () => void;
}

export function ChatInput({ message, setMessage, onSubmit, onBranchOut, deleteBranch }: ChatInputProps) {
    return (
        <ChatInputContainer>
            <div className="max-w-2xl mx-auto px-4">
                <form 
                    onSubmit={onSubmit}
                    className="relative flex items-center bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-xl shadow-xl p-3 group transition-shadow duration-300 ease-in-out focus-within:ring-2 focus-within:ring-zinc-300"
                >
                    <textarea
                        className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none focus-visible:ring-offset-0 focus-visible:ring-0 text-base placeholder:text-zinc-500 resize-none min-h-[40px] max-h-32 overflow-y-auto py-2"
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                        }}   
                        placeholder="Type your message..."
                        rows={1}
                    />
                    <div className="flex items-center gap-1">
                        <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-10 w-10 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                            disabled={!message.trim()}
                        >
                            <SendHorizonal size={20} />
                        </Button>
                        {onBranchOut && (
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="rounded-full h-10 w-10 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                onClick={onBranchOut}
                            >
                                <GitFork size={20} />
                            </Button>
                        )}
                        {deleteBranch && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="rounded-full h-10 w-10 text-red-500 hover:bg-red-100 hover:text-red-600"
                                onClick={deleteBranch}
                            >
                                <Trash2 size={20} />
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </ChatInputContainer>
    );
}