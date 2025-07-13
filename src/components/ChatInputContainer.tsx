"use client";

import { useUiStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export default function ChatInputContainer({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isSidebarOpen } = useUiStore();

    return (
        <div
            className={cn(
                "fixed bottom-6 left-0 right-0 transition-all duration-300 ease-in-out",
                isSidebarOpen ? "left-64" : "left-20"
            )}
        >
            {children}
        </div>
    );
} 