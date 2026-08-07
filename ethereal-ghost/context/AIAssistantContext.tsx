import React, { createContext, useContext, useState } from 'react';

interface AIAssistantContextValue {
  visible: boolean;
  open: () => void;
  close: () => void;
}

const AIAssistantContext = createContext<AIAssistantContextValue | null>(null);

export function AIAssistantProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  return (
    <AIAssistantContext.Provider
      value={{ visible, open: () => setVisible(true), close: () => setVisible(false) }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const ctx = useContext(AIAssistantContext);
  if (!ctx) throw new Error('useAIAssistant must be used within AIAssistantProvider');
  return ctx;
}
