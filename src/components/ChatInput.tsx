import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ChatInputProps {
    message: string;
    setMessage: (message: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onBranchOut: () => void;
    deleteBranch: () => void;
}

export function ChatInput({ message, setMessage, onSubmit, onBranchOut, deleteBranch }: ChatInputProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-zinc-200 py-4">
            <div className="max-w-4xl mx-auto px-4">
                <form onSubmit={onSubmit}>
                    <div className="flex items-center justify-center gap-2">
                        <Input
                            type="text"
                            className="w-full md:w-2/3 bg-white/80 border-zinc-200 h-12 text-base font-medium rounded-full shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                        />
                        <Button
                            type="submit"
                            variant="outline"
                            className="h-12 px-6 rounded-full font-medium transition-all hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 hover:shadow-sm"
                        >
                            Send
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 px-6 rounded-full font-medium transition-all hover:bg-zinc-100 hover:border-zinc-300 hover:shadow-sm"
                            onClick={onBranchOut}
                        >
                            BranchOut
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 px-6 rounded-full font-medium transition-all hover:bg-red-50 hover:border-red-200 hover:text-red-600 hover:shadow-sm"
                            onClick={deleteBranch}
                        >
                            Delete
                        </Button>
                    </div>
                </form>
                <footer className="text-center text-sm text-zinc-500 mt-4">
                    Built with <span className="text-red-400">❤️</span> by aditya <a href="https://github.com/sjak1" className="text-zinc-600 hover:text-zinc-800 transition-colors underline">GitHub</a>
                </footer>
            </div>
        </div>
    );
}