import create from 'zustand';

interface AIEnhancementStore {
  remainingResponses: number;
  lastResetTime: number;
  resetRemainingResponses: () => void;
  decrementRemainingResponses: () => void;
}

// Store for managing rate limiting
export const useAIEnhancementStore = create<AIEnhancementStore>((set: any) => ({
  remainingResponses: 2,
  lastResetTime: Date.now(),
  resetRemainingResponses: () => set({ remainingResponses: 2, lastResetTime: Date.now() }),
  decrementRemainingResponses: () => set((state: AIEnhancementStore) => ({ remainingResponses: state.remainingResponses - 1 })),
}));

export async function enhanceCheckInNote(note: string): Promise<string> {
  try {
    const response = await fetch('/api/ai/enhance-note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ note }),
    });

    if (!response.ok) {
      throw new Error('Failed to enhance note');
    }

    const data = await response.json();
    return data.enhancedNote;
  } catch (error) {
    console.error('Error enhancing note:', error);
    throw error;
  }
}

// Check if user can make more AI enhancement requests
export function canEnhanceMore(store: AIEnhancementStore): boolean {
  const hourInMs = 60 * 60 * 1000;
  const now = Date.now();
  
  // Reset counter if it's been more than an hour
  if (now - store.lastResetTime >= hourInMs) {
    store.resetRemainingResponses();
    return true;
  }
  
  return store.remainingResponses > 0;
} 