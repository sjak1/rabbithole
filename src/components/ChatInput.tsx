import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ChatInputProps {
    message: string;
    setMessage: (message: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ChatInput({ message, setMessage, onSubmit }: ChatInputProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/80 pb-4 pt-6">
            <div className="max-w-4xl mx-auto px-4">
                <form onSubmit={onSubmit}>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Input
                            type="text"
                            className="w-full md:w-2/3 bg-zinc-100 border-zinc-200 h-12 text-base font-medium"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                        />
                        <Button type="submit" variant="outline" className="h-12">Send</Button>
                    </div>
                </form>
                <footer className="text-center text-sm text-zinc-500">
                    Built with ❤️ by aditya <a href="https://github.com/yourusername" className="hover:text-zinc-800 transition-colors">GitHub</a>
                </footer>
            </div>
        </div>
    );
}