"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/store';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, RabbitIcon, GitBranch } from 'lucide-react';

export default function SideNav() {
    const { loadBranches, branchTitles } = useStore();
    const pathname = usePathname();

    useEffect(() => {
        loadBranches();
    }, [loadBranches]);

    const branches = Object.entries(branchTitles);

    return (
        <aside className="w-64 flex flex-col fixed inset-y-0 z-40 bg-white border-r border-zinc-200">
             <div className="p-4 border-b border-zinc-200">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-lg">
                        <RabbitIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-zinc-900">
                        Rabbithole
                    </span>
                </Link>
            </div>
            <div className="p-4 space-y-2">
                <Link href="/" className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800 transition-colors">
                    <Plus size={16} />
                    New Chat
                </Link>
                <Link href="/flow" className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 rounded-md hover:bg-zinc-200 transition-colors">
                    <GitBranch size={16} />
                    View Flow
                </Link>
            </div>
            <ScrollArea className="flex-1">
                <nav className="px-4 pb-4">
                    <p className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Chats</p>
                    <ul className="space-y-1">
                        {branches.map(([id, title]) => {
                            const isActive = pathname === `/branch/${id}`;
                            return (
                                <li key={id}>
                                    <Link
                                        href={`/branch/${id}`}
                                        className={`block w-full text-left px-4 py-2 text-sm rounded-md truncate transition-colors ${
                                            isActive
                                                ? 'bg-zinc-200 text-zinc-900 font-semibold'
                                                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                                        }`}
                                    >
                                        {title}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </ScrollArea>
        </aside>
    );
}