import { useState, useCallback } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string | any, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Date.now();
      
      // Debug logging
      console.log('🔔 showToast called with:', { message, type, messageType: typeof message });
      
      // Ensure message is always a string
      const messageStr = typeof message === 'string' 
        ? message 
        : typeof message === 'object' && message !== null
        ? (message.message || message.error || JSON.stringify(message))
        : String(message);
      
      console.log('🔔 Final message:', messageStr);
      
      setToasts((prev) => [...prev, { id, message: messageStr, type }]);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
  };
}

