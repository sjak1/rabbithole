"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Clipboard, Check } from 'lucide-react';
import { Message } from '@/api';

interface ChatMessageProps {
    message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [codeCopied, setCodeCopied] = useState<number | null>(null);

    const handleCopy = (text: string, index?: number) => {
        navigator.clipboard.writeText(text);
        if (typeof index === 'number') {
            setCodeCopied(index);
            setTimeout(() => setCodeCopied(null), 2000);
        } else {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div
            className={`flex items-end gap-3 group relative ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
            {message.role === 'assistant' && (
                <div className="w-2 h-2 mb-4 rounded-full bg-zinc-300" />
            )}

            <div className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                    className={`
                        relative px-5 py-3 rounded-md
                        ${message.role === 'user'
                            ? 'bg-zinc-900 text-zinc-50'
                            : 'bg-zinc-50 border-l-2 border-zinc-200'
                        }
                        shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]
                    `}
                >
                    <button
                        onClick={() => handleCopy(message.content)}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-700/50 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        {isCopied ? <Check size={14} /> : <Clipboard size={14} />}
                    </button>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ node, className, children }) {
                                const match = /language-(\w+)/.exec(className || '');
                                const codeString = String(children).replace(/\n$/, '');
                                
                                // Generate a stable key for the code block
                                const codeIndex = node?.position?.start?.offset ?? Math.random();

                                return match ? (
                                    <div className="relative my-2 bg-zinc-800 rounded-md">
                                        <div className="flex items-center justify-between px-4 py-1 bg-zinc-700 rounded-t-md">
                                            <span className="text-xs text-zinc-400">{match[1]}</span>
                                            <button onClick={() => handleCopy(codeString, codeIndex)}>
                                                {codeCopied === codeIndex ? (
                                                    <span className="text-xs flex items-center gap-1 text-green-400"><Check size={14} /> Copied!</span>
                                                ) : (
                                                    <span className="text-xs flex items-center gap-1 text-zinc-400 hover:text-white"><Clipboard size={14} /> Copy</span>
                                                )}
                                            </button>
                                        </div>
                                        <SyntaxHighlighter
                                            style={vscDarkPlus as { [key: string]: React.CSSProperties }}
                                            language={match[1]}
                                            PreTag="div"
                                        >
                                            {codeString}
                                        </SyntaxHighlighter>
                                    </div>
                                ) : (
                                    <code className="bg-zinc-200 text-zinc-800 px-1 py-0.5 rounded-md">
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>
            </div>

            {message.role === 'user' && (
                <div className="w-2 h-2 mb-4 rounded-full bg-zinc-400" />
            )}
        </div>
    );
}; 