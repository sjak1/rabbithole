"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/store';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, RabbitIcon, GitBranch, LogIn, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, useAuth } from '@clerk/nextjs';
import { Button } from './ui/button';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export default function SideNav() {
    const { getToken } = useAuth();
    const { loadBranches, branchTitles } = useStore();
    const { isSidebarOpen, toggleSidebar } = useUiStore();
    const pathname = usePathname();

    useEffect(() => {
        const loadBranchesWithToken = async () => {
            const token = await getToken();
            if (!token) return;
            await loadBranches(token);
        };
        loadBranchesWithToken();
    }, [loadBranches, getToken]);

    const branches = Object.entries(branchTitles);

    return (
        <aside
            className={cn(
                "flex flex-col fixed inset-y-0 z-40 bg-white border-r border-zinc-200 transition-all duration-300 ease-in-out",
                isSidebarOpen ? "w-64" : "w-20"
            )}
        >
            <div className={cn(
                "p-4 border-b border-zinc-200 flex items-center",
                isSidebarOpen ? "justify-between" : "justify-center"
            )}>
                {isSidebarOpen && (
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-lg">
                            <RabbitIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-zinc-900">
                            Rabbithole
                        </span>
                    </Link>
                )}
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-zinc-500 hover:text-zinc-900 group">
                    {isSidebarOpen ? <PanelLeftClose size={20} /> : (
                        <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-lg group-hover:bg-zinc-800 transition-colors">
                            <RabbitIcon className="w-5 h-5 text-white block group-hover:hidden" />
                            <PanelLeftOpen className="w-5 h-5 text-white hidden group-hover:block" />
                        </div>
                    )}
                </Button>
            </div>

            <SignedIn>
                <div className="p-4 space-y-2">
                    <Link href="/" className={cn("flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800 transition-colors", !isSidebarOpen && "px-2")}>
                        <Plus size={16} />
                        {isSidebarOpen && "New Chat"}
                    </Link>
                    <Link href="/flow" className={cn("flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 rounded-md hover:bg-zinc-200 transition-colors", !isSidebarOpen && "px-2")}>
                        <GitBranch size={16} />
                        {isSidebarOpen && "View Flow"}
                    </Link>
                </div>
                {isSidebarOpen && (
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
                                                className={cn(
                                                    "block w-full text-left px-4 py-2 text-sm rounded-md truncate transition-colors",
                                                    isActive
                                                        ? 'bg-zinc-200 text-zinc-900 font-semibold'
                                                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                                                )}
                                            >
                                                {title}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </ScrollArea>
                )}
            </SignedIn>

            <SignedOut>
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="text-center space-y-4">
                        <LogIn className="w-12 h-12 text-zinc-400 mx-auto" />
                        {isSidebarOpen && (
                            <>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-900">Welcome to Rabbithole</h3>
                                    <p className="text-xs text-zinc-500">Sign in to start chatting and explore different conversation paths</p>
                                 </div>
                                <SignInButton>
                                    <Button size="sm" className="w-full">
                                        Sign In
                                    </Button>
                                </SignInButton>
                            </>
                        )}
                    </div>
                </div>
            </SignedOut>
        </aside>
    );
}