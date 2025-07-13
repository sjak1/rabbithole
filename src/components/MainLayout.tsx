"use client";

import { useUiStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import Header from './Header';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isSidebarOpen } = useUiStore();

    return (
        <div
            className={cn(
                "flex flex-col flex-1 h-screen transition-all duration-300 ease-in-out",
                isSidebarOpen ? "ml-64" : "ml-20"
            )}
        >
            <Header />
            <main className="flex-1 overflow-y-auto p-6">
                {children}
            </main>
        </div>
    );
} 