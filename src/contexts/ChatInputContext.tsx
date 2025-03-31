
import React, { createContext, useState, useContext } from 'react';

interface ChatInputContextProps {
  inputValue: string;
  setInputValue: (value: string) => void;
}

const ChatInputContext = createContext<ChatInputContextProps | undefined>(undefined);

export const ChatInputProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <ChatInputContext.Provider value={{ inputValue, setInputValue }}>
      {children}
    </ChatInputContext.Provider>
  );
};

export const useChatInput = () => {
  const context = useContext(ChatInputContext);
  if (!context) {
    throw new Error('useChatInput must be used within a ChatInputProvider');
  }
  return context;
};
