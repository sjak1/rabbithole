export interface User {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    credits: number;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export type Branch = {
  id: string;
  name: string;
  parentId?: string | null;
}; 