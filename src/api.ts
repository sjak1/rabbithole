const API_URL = 'http://localhost:3000';

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

export const getBranchParent = async (branchId: string): Promise<Branch | null>  => {
  try{
    const res = await fetch(`${API_URL}/parent/${branchId}`);
    if(!response.ok) throw new Error('failed to fetch branch parent');
    return respose.json()
  } catch(error) {
    console.error('error fetching branch parent : ', error);
    throw error;
  }
}

export const deleteBranch = async (branchId: string): Promise<void> => {
  try{
    const res = await fetch(`${API_URL}/${branchId}`);
    if(!response.ok) throw new Error('failed to delete branch')
    return response.json
  } catch {
    cosnole.error('Error deleting the branch', error);
    throw error;
  }
}

export const setBranchTitle = async()
