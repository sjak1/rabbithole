const API_URL = 'http://localhost:4000';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export type Branch = {
  id: string;
  name: string;
  parentId?: string | null;
};

export const getMessages = async (branchId: string): Promise<Message[]> => {
    try {
        const response = await fetch(`${API_URL}/messages/${branchId}`, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch messages');
        return response.json();
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
};

export const setMessages = async (branchId: string, message: Message): Promise<Message[]> => {
    try {
        const response = await fetch(`${API_URL}/messages/${branchId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }), // Send single message to match backend
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to set messages');
        return response.json(); // Returns updated messages array
    } catch (error) {
        console.error('Error setting messages:', error);
        throw error;
    }
};

export const setBranchParent = async (childId: string, parentId: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/parent/${childId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ childId, parentId }),
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to set branch parent');
    } catch (error) {
        console.error('Error setting branch parent:', error);
        throw error;
    }
};

export const getBranchParent = async (branchId: string): Promise<Branch | null> => {
    try {
        const response = await fetch(`${API_URL}/parent/${branchId}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch branch parent');
        return response.json();
    } catch (error) {
        console.error('Error fetching branch parent:', error);
        throw error;
    }
};

export const deleteBranch = async (branchId: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/branch/${branchId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to delete branch');
    } catch (error) {
        console.error('Error deleting the branch:', error);
        throw error;
    }
};

export const setBranchTitle = async (branchId: string, title: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/title/${branchId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to set branch title');
    } catch (error) {
        console.error('Error setting branch title:', error);
        throw error;
    }
};

export const createBranch = async (branchId: string, name: string = "New Branch"): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/branch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ branchId, name }),
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to create branch');
    } catch (error) {
        console.error('Error creating branch:', error);
        throw error;
    }
};

