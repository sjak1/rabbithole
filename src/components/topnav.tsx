"use client";
import Link from 'next/link';
import { RabbitIcon } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';


export default function TopNav() {

    const { data: session } = useSession();

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-sm bg-white/80 border-b border-gray-200 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center gap-2 group">
                        <RabbitIcon className="w-6 h-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
                        <span className="text-2xl font-geist-sans font-bold tracking-tight bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 bg-clip-text text-transparent group-hover:from-gray-800 group-hover:to-gray-900 transition-all">
                            Rabbithole
                        </span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <Link
                            href="/flow"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-all"
                        >
                            View Flow
                        </Link>
                        <Link
                            href="/explore"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-all"
                        >
                            Explore
                        </Link>
                        <a
                            href="https://github.com/sjak1/rabbithole"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-all"
                        >
                            GitHub
                        </a>
                        {session ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600">
                                    Hey {session.user?.name}!
                                </span>
                                <button
                                    onClick={() => signOut()}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-full transition-all"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => signIn('google')}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all"
                            >
                                Sign In with Google
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
