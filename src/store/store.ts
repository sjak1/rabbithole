import { create } from "zustand";
import { persist } from 'zustand/middleware';
import { getMessages, setMessages, setBranchParent, getBranchParent, deleteBranch, setBranchTitle, createBranch, getBranches } from '../api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Store {
    messagesByBranch: Record<string, Message[]>;
    branchParents: Record<string, string>;
    branchTitles: Record<string, string>;
    getMessagesForBranch: (branchId: string) => Promise<Message[]>;
    addMessageToBranch: (branchId: string, message: Message) => Promise<Message[]>;
    setBranchParent: (branchId: string, parentId: string) => Promise<void>;
    getBranchParent: (branchId: string) => Promise<string | null>;
    setBranchTitle: (branchId: string, title: string) => Promise<void>;
    getBranchTitle: (branchId: string) => string | null;
    deleteBranch: (branchId: string) => Promise<void>;
    createBranch: (branchId: string, name?: string) => Promise<void>;
    loadBranches: () => Promise<void>;
}

export const useStore = create<Store>()(
    persist(
        (set, get) => ({
            messagesByBranch: {},
            branchParents: {},
            branchTitles: {},
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
            addMessageToBranch: async (branchId, message) => {
                const updatedMessages = await setMessages(branchId, message);
                set(state => ({
                    messagesByBranch: {
                        ...state.messagesByBranch,
                        [branchId]: updatedMessages
                    }
                }));
                return updatedMessages;
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
            createBranch: async (branchId, name) => {
                await createBranch(branchId, name);
            },
            loadBranches: async () => {
                const branches = await getBranches();
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
            }
        }),
        {
            name: 'chat-storage',
            skipHydration: true,
        }
    )
);

