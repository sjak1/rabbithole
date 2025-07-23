import { create } from "zustand";
import { persist } from 'zustand/middleware';
import { getMessages, setMessages, setBranchParent, getBranchParent, deleteBranch, setBranchTitle as apiSetBranchTitle, createBranch, getBranches, getUser } from '../api';
import { User } from '@/types';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface Store {
    messagesByBranch: Record<string, Message[]>;
    branchParents: Record<string, string>;
    branchTitles: Record<string, string>;
    getMessagesForBranch: (branchId: string, token: string) => Promise<Message[]>;
    addMessageToBranch: (branchId: string, message: Message, token: string) => Promise<Message[]>;
    setBranchParent: (branchId: string, parentId: string, token: string) => Promise<void>;
    getBranchParent: (branchId: string, token: string) => Promise<string | null>;
    setBranchTitle: (branchId: string, title: string, token: string) => Promise<void>;
    getBranchTitle: (branchId: string) => string | null;
    deleteBranch: (branchId: string, token: string) => Promise<void>;
    createBranch: (branchId: string, name: string, token: string) => Promise<void>;
    loadBranches: (token: string) => Promise<void>;
    setCredits: (credits: number) => void;
    credits: number;
    user: User | null;
    loadUser: (token: string) => Promise<void>;
}

export const useStore = create<Store>()(
    persist(
        (set, get) => ({
            messagesByBranch: {},
            branchParents: {},
            branchTitles: {},
            credits: 0.05,
            user: null,
            getMessagesForBranch: async (branchId, token) => {
                const messages = await getMessages(branchId, token);
                set(state => ({
                    messagesByBranch: {
                        ...state.messagesByBranch,
                        [branchId]: messages
                    }
                }));
                return messages;
            },
            addMessageToBranch: async (branchId, message, token) => {
                const updatedMessages = await setMessages(branchId, message, token);
                set(state => ({
                    messagesByBranch: {
                        ...state.messagesByBranch,
                        [branchId]: updatedMessages
                    }
                }));
                return updatedMessages;
            },
            setBranchParent: async (branchId, parentId, token) => {
                await setBranchParent(branchId, parentId, token);
                set(state => ({
                    branchParents: {
                        ...state.branchParents,
                        [branchId]: parentId
                    }
                }));
            },
            getBranchParent: async (branchId, token) => {
                const parent = await getBranchParent(branchId, token);
                if (parent) {
                    set(state => ({
                        branchParents: {
                            ...state.branchParents,
                            [branchId]: parent.id
                        }
                    }));
                }
                return parent?.id || null;
            },
            setBranchTitle: async (branchId, title, token) => {
                await apiSetBranchTitle(branchId, title, token);
                set(state => ({
                    branchTitles: {
                        ...state.branchTitles,
                        [branchId]: title
                    }
                }));
            },
            getBranchTitle: (branchId) => get().branchTitles[branchId] || null,
            deleteBranch: async (branchId, token) => {
                await deleteBranch(branchId, token);
                set(state => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [branchId]: _msg, ...restMessages } = state.messagesByBranch;
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [branchId]: _par, ...restParents } = state.branchParents;
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [branchId]: _title, ...restTitles } = state.branchTitles;
                    return {
                        messagesByBranch: restMessages,
                        branchParents: restParents,
                        branchTitles: restTitles,
                    };
                });
            },
            createBranch: async (branchId, name, token) => {
                await createBranch(branchId, name, token);
            },
            loadBranches: async (token) => {
                const branches = await getBranches(token);
                set(() => {
                    const messagesByBranch: Record<string, Message[]> = {};
                    const branchParents: Record<string, string> = {};
                    const branchTitles: Record<string, string> = {};

                    branches.forEach(br => {
                        messagesByBranch[br.id] = (br as unknown as { messages?: Message[] }).messages ?? [];
                        if (br.parentId) branchParents[br.id] = br.parentId;
                        branchTitles[br.id] = br.name;
                    });

                    return { messagesByBranch, branchParents, branchTitles };
                });
            },
            setCredits: (credits) => {
                set(() => ({
                    credits: credits
                }));
            },
            loadUser: async (token) => {
                const user = await getUser(token);
                set(() => ({ user, credits: user?.credits || 0 }));
            },
        }),
        {
            name: 'chat-storage',
            skipHydration: true,
        }
    )
);

