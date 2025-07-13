"use client";

import { useStore } from "@/store/store";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export default function Header() {
    const { branchTitles, credits } = useStore();
    const pathname = usePathname();
    const branchId = pathname.split('/').pop();
    const title = branchId ? branchTitles[branchId] : "New Chat";

    const formattedCredits = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 4,
    }).format(credits);

    return (
        <header className="flex items-center justify-between p-4 bg-white border-b border-zinc-200">
            <h1 className="text-lg font-semibold text-zinc-900 truncate">{title}</h1>
            <div className="flex items-center gap-4">
                <SignedIn>
                <Badge variant="outline" className="text-sm font-mono">
                    Credits: {formattedCredits}
                </Badge>
                    <UserButton />
                </SignedIn>
                <SignedOut>
                    <SignInButton>
                        <Button>Sign In</Button>
                    </SignInButton>
                </SignedOut>
            </div>
        </header>
    );
} 