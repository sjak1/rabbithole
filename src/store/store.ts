import { create } from "zustand";
import { persist } from 'zustand/middleware';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Store {
    messagesByBranch: Record<string, Message[]>;
    branchParents: Record<string, string>;
    setMessagesForBranch: (branchId: string, messages: Message[]) => void;
    getMessagesForBranch: (branchId: string) => Message[];
    setBranchParent: (branchId: string, parentId: string) => void;
    getBranchParent: (branchId: string) => string | null;
}

export const useStore = create<Store>()(
    persist(
        (set, get) => ({
            messagesByBranch: {},
            branchParents: {},
            setMessagesForBranch: (branchId, messages) => set(state => ({
                messagesByBranch: {
                    ...state.messagesByBranch,
                    [branchId]: messages
                }
            })),
            setBranchParent: (branchId, parentId) => set(state => ({
                branchParents: {
                    ...state.branchParents,
                    [branchId]: parentId
                }
            })),
            getBranchParent: (branchId) => get().branchParents[branchId] || null,
            getMessagesForBranch: (branchId) => get().messagesByBranch[branchId] || []
        }),
        {
            name: 'chat-storage',
            skipHydration: true,
        }
    )
);

