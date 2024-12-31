import Link from 'next/link';

export default function TopNav() {
    return (
        <div className="flex justify-center items-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center gap-4">
                <Link href="/">
                    <div className="text-3xl font-geist-sans font-extrabold tracking-tighter bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer">
                        Rabbithole
                    </div>
                </Link>
                <Link href="/flow" className="text-sm text-gray-600 hover:text-gray-900">
                    View Flow
                </Link>
            </div>
        </div>
    );
}
