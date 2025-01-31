import { create } from "zustand";
import { persist } from 'zustand/middleware';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Store {
    messagesByBranch: Record<string, Message[]>;
    branchParents: Record<string, string>;
    branchTitles: Record<string, string>;
    setMessagesForBranch: (branchId: string, messages: Message[]) => void;
    getMessagesForBranch: (branchId: string) => Message[];
    setBranchParent: (branchId: string, parentId: string) => void;
    getBranchParent: (branchId: string) => string | null;
    setBranchTitle: (branchId: string, title: string) => void;
    getBranchTitle: (branchId: string) => string | null;
    deleteBranch: (branchId: string) => Promise<void>;
}

export const useStore = create<Store>()(
    persist(
        (set, get) => ({
            messagesByBranch: {},
            branchParents: {},
            branchTitles: {},
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
            getMessagesForBranch: (branchId) => get().messagesByBranch[branchId] || [],
            setBranchTitle: (branchId, title) => set(state => ({
                branchTitles: {
                    ...state.branchTitles,
                    [branchId]: title
                }
            })),
            getBranchTitle: (branchId) => get().branchTitles[branchId] || null,
            deleteBranch: (branchId) => new Promise(resolve => {
                set(state => {
                    const { [branchId]: _messages, ...restMessages } = state.messagesByBranch;
                    const { [branchId]: _parent, ...restParents } = state.branchParents;
                    const { [branchId]: _title, ...restTitles } = state.branchTitles;
                    return {
                        messagesByBranch: restMessages,
                        branchParents: restParents,
                        branchTitles: restTitles
                    }
                })
                resolve();
            })
        }),
        {
            name: 'chat-storage',
            skipHydration: true,
        }
    )
);

