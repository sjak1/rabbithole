import { create } from "zustand";
import { persist } from 'zustand/middleware';
import { getMessages, setMessages, setBranchParent, getBranchParent, deleteBranch, setBranchTitle } from '../api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Store {
    messagesByBranch: Record<string, Message[]>;
    branchParents: Record<string, string>;
    branchTitles: Record<string, string>;
    setMessagesForBranch: (branchId: string, messages: Message[]) => Promise<void>;
    getMessagesForBranch: (branchId: string) => Promise<Message[]>;
    setBranchParent: (branchId: string, parentId: string) => Promise<void>;
    getBranchParent: (branchId: string) => Promise<string | null>;
    setBranchTitle: (branchId: string, title: string) => Promise<void>;
    getBranchTitle: (branchId: string) => string | null;
    deleteBranch: (branchId: string) => Promise<void>;
}

export const useStore = create<Store>()(
    persist(
        (set, get) => ({
            messagesByBranch: {},
            branchParents: {},
            branchTitles: {},
            setMessagesForBranch: async (branchId, messages) => {
                await setMessages(branchId, messages);
                set(state => ({
                    messagesByBranch: {
                        ...state.messagesByBranch,
                        [branchId]: messages
                    }
                }));
            },
            getMessagesForBranch: async (branchId) => {
                const messages = await getMessages(branchId);
                set(state => ({
                    messagesByBranch: {
                        ...state.messagesByBranch,
                        [branchId]: messages
                    }
                }));
                return messages;
            },
            setBranchParent: async (branchId, parentId) => {
                await setBranchParent(branchId, parentId);
                set(state => ({
                    branchParents: {
                        ...state.branchParents,
                        [branchId]: parentId
                    }
                }));
            },
            getBranchParent: async (branchId) => {
                const parent = await getBranchParent(branchId);
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
            setBranchTitle: async (branchId, title) => {
                await setBranchTitle(branchId, title);
                set(state => ({
                    branchTitles: {
                        ...state.branchTitles,
                        [branchId]: title
                    }
                }));
            },
            getBranchTitle: (branchId) => get().branchTitles[branchId] || null,
            deleteBranch: async (branchId) => {
                await deleteBranch(branchId);
                set(state => {
                    const { [branchId]: _messages, ...restMessages } = state.messagesByBranch;
                    const { [branchId]: _parent, ...restParents } = state.branchParents;
                    const { [branchId]: _title, ...restTitles } = state.branchTitles;
                    return {
                        messagesByBranch: restMessages,
                        branchParents: restParents,
                        branchTitles: restTitles
                    }
                });
            }
        }),
        {
            name: 'chat-storage',
            skipHydration: true,
        }
    )
);

