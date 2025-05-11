const API_URL = 'http://localhost:3000';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const getMessages = async (branchId: string): Promise<Message[]> => {
    try {
        const response = await fetch(`${API_URL}/messages/${branchId}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        return response.json();
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
};

export const setMessages = async (branchId: string, messages: Message[]): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/messages/${branchId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
        });
        if (!response.ok) throw new Error('Failed to set messages');
    } catch (error) {
        console.error('Error setting messages:', error);
        throw error;
    }
};

export const setBranchParent = async (childId: string, parentId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/parent/${childId}`,{
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
      body: JSON.stringify({childId,parentId})
    })
    if (!response.ok) throw new Error('Failed to set branch parent')
  } catch (error) {
    console.error('Error setting branch parent:', error);
    throw error;
  }
}
