import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(undefined);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgColor = 'bg-brand-cream  border-l-4 border-brand-brown';
          let Icon = Info;
          let iconColor = 'text-brand-brown';

          if (toast.type === 'success') {
            bgColor = 'bg-brand-cream  border-l-4 border-emerald-500';
            Icon = CheckCircle;
            iconColor = 'text-brand-brown';
          } else if (toast.type === 'error') {
            bgColor = 'bg-brand-cream  border-l-4 border-rose-500';
            Icon = AlertCircle;
            iconColor = 'text-brand-brown';
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start p-4 rounded-lg shadow-lg justify-between border border-brand-sage/40  pointer-events-auto animate-fade-in ${bgColor}`}
              role="alert"
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
                <p className="text-sm font-medium text-brand-navy ">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-brand-navy/60 hover:text-brand-navy/60 :text-brand-navy/60 ml-4 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

