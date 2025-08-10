'use client';

import React from 'react';
import { Toast as ToastType } from '@/hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const getToastStyles = () => {
    const baseStyles = "relative flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow";
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} text-green-500 bg-green-50 border border-green-200`;
      case 'error':
        return `${baseStyles} text-red-500 bg-red-50 border border-red-200`;
      case 'warning':
        return `${baseStyles} text-yellow-500 bg-yellow-50 border border-yellow-200`;
      case 'info':
        return `${baseStyles} text-blue-500 bg-blue-50 border border-blue-200`;
      default:
        return baseStyles;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <i className="fas fa-check-circle text-green-500"></i>;
      case 'error':
        return <i className="fas fa-exclamation-circle text-red-500"></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle text-yellow-500"></i>;
      case 'info':
        return <i className="fas fa-info-circle text-blue-500"></i>;
      default:
        return <i className="fas fa-bell text-gray-500"></i>;
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
        {getIcon()}
      </div>
      <div className="ml-3 text-sm font-normal">
        <div className="font-semibold">{toast.title}</div>
        {toast.message && (
          <div className="text-xs opacity-75 mt-1">{toast.message}</div>
        )}
      </div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8"
        onClick={() => onRemove(toast.id)}
      >
        <span className="sr-only">Đóng</span>
        <i className="fas fa-times text-sm"></i>
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default Toast;
