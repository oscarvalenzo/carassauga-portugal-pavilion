import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={18} strokeWidth={2.5} />,
    error: <XCircle size={18} strokeWidth={2.5} />,
    info: <Info size={18} strokeWidth={2.5} />,
  };

  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div
      className={`mx-4 mt-4 flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-lg border ${colors[type]} animate-slideUp backdrop-blur-xl`}
      style={{ maxWidth: '400px' }}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="flex-1 text-sm font-semibold tracking-tight">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-60 transition-opacity"
      >
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
