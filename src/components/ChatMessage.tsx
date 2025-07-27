"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Clipboard, Check } from 'lucide-react';
import { motion } from 'motion/react';
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
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
                duration: 0.5, 
                ease: [0.23, 1, 0.32, 1],
                delay: 0.1
            }}
            className={`flex items-end gap-3 group relative ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
            {message.role === 'assistant' && (
                <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3, ease: "backOut" }}
                    className="w-2 h-2 mb-4 rounded-full bg-zinc-300 flex-shrink-0" 
                />
            )}

            <div className={`flex flex-col ${message.role === 'user' ? 'max-w-[60%] items-end' : 'items-start max-w-[calc(100%-2rem)]'}`}>
                <motion.div
                    initial={{ opacity: 0, x: message.role === 'user' ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                        duration: 0.4, 
                        ease: [0.16, 1, 0.3, 1],
                        delay: 0.15
                    }}
                    className={`
                        relative py-3 text-base leading-loose break-words
                        ${message.role === 'user'
                            ? 'px-5 bg-zinc-900 text-zinc-50 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]'
                            : 'px-5 bg-zinc-50 border-l-2 border-zinc-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] rounded-md'
                        }
                    `}
                >
                    <button
                        onClick={() => handleCopy(message.content)}
                        className={`absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                            message.role === 'user' 
                                ? 'bg-zinc-700/50 text-zinc-300' 
                                : 'bg-zinc-200/50 text-zinc-600'
                        }`}
                    >
                        {isCopied ? <Check size={14} /> : <Clipboard size={14} />}
                    </button>
                    <div className="pr-8 overflow-hidden">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, className, children }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const codeString = String(children).replace(/\n$/, '');
                                    
                                    // Generate a stable key for the code block
                                    const codeIndex = node?.position?.start?.offset ?? 0;

                                    return match ? (
                                        <div className="relative group/code my-4 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                                            <div className="absolute top-3 right-3 z-10 flex items-center gap-2 opacity-0 group-hover/code:opacity-100 transition-opacity duration-300">
                                                <span className="text-xs text-zinc-400 select-none">
                                                    {match[1]}
                                                </span>
                                                <button
                                                    onClick={() => handleCopy(codeString, codeIndex)}
                                                    className="p-1 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-50"
                                                >
                                                    {codeCopied === codeIndex ? (
                                                        <Check size={14} className="text-emerald-400" />
                                                    ) : (
                                                        <Clipboard size={14} />
                                                    )}
                                                </button>
                                            </div>
                                            <SyntaxHighlighter
                                                style={vscDarkPlus as { [key: string]: React.CSSProperties }}
                                                language={match[1]}
                                                PreTag="div"
                                                customStyle={{
                                                    padding: '1rem',
                                                    backgroundColor: 'transparent',
                                                    overflow: 'auto',
                                                }}
                                            >
                                                {codeString}
                                            </SyntaxHighlighter>
                                        </div>
                                    ) : (
                                        <code className="bg-zinc-200 text-zinc-800 px-1 py-0.5 rounded-md break-all">
                                            {children}
                                        </code>
                                    );
                                },
                                p: ({ children }) => (
                                    <p className="mb-2 last:mb-0 break-words">{children}</p>
                                ),
                                ul: ({ children }) => (
                                    <ul className="list-disc list-outside ml-6 mb-2 last:mb-0 break-words">{children}</ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="list-decimal list-outside ml-6 mb-2 last:mb-0 break-words">{children}</ol>
                                ),
                                li: ({ children }) => (
                                    <li className="mb-1 break-words">{children}</li>
                                ),
                                h1: ({ children }) => (
                                    <h1 className="text-xl font-bold mb-2 break-words">{children}</h1>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="text-lg font-semibold mb-2 break-words">{children}</h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="text-md font-semibold mb-2 break-words">{children}</h3>
                                ),
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-zinc-300 pl-4 italic mb-2 break-words">{children}</blockquote>
                                ),
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                </motion.div>
            </div>

            {message.role === 'user' && (
                <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3, ease: "backOut" }}
                    className="w-2 h-2 mb-4 rounded-full bg-zinc-400 flex-shrink-0" 
                />
            )}
        </motion.div>
    );
}; 
