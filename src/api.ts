import { User } from '@/types';

const API_URL = 'http://localhost:4000';

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface Branch {
    id: string;
    name: string;
    parentId?: string;
}


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

export const generateTitle = async (branchId: string): Promise<{title: string, credits: number}> => {
    try {
        const response = await fetch(`${API_URL}/title/generate/${branchId}`, {
            method: 'POST',
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to generate title');

        const data = await response.json();
        return {
            title: data.updatedBranch.name,
            credits: data.remainingCredits
        };

    } catch (error) {
        console.error('Error generating title:', error);
        throw error;
    }
};

export const getUser = async (): Promise<User | null> => {
    try {
        const response = await fetch(`${API_URL}/api/user`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json();
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

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

// Fetch all branches for the signed-in user
export const getBranches = async (): Promise<Branch[]> => {
    try {
        const response = await fetch(`${API_URL}/branches`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch branches');
        return response.json();
    } catch (error) {
        console.error('Error fetching branches:', error);
        return [];
    }
};

export const getLLMResponse = async (
  messages: Message[], 
  onContent: (content: string) => void
): Promise<{ content: string; credits: number }> => {
  return new Promise((resolve, reject) => {
    // Since EventSource doesn't support POST, we'll use fetch with streaming
    fetch(`${API_URL}/api/llm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      credentials: 'include',
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch LLM response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (!reader) {
        throw new Error('No reader available');
      }

      const readStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'content') {
                    fullContent += data.content;
                    onContent(fullContent);
                  } else if (data.type === 'complete') {
                    resolve({ content: fullContent, credits: data.credits });
                    return;
                  } else if (data.type === 'error') {
                    reject(new Error(data.error));
                    return;
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          reject(error);
        }
      };

      readStream();
    })
    .catch(error => {
      console.error('Error fetching LLM response:', error);
      reject(error);
    });
  });
};

