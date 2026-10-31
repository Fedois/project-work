import { useState, createContext, useContext, useCallback, type ReactNode } from "react";
import Toast, { type ToastType, type ToastProps } from "../components/Toast";

const ToastContext = createContext<{ showToast: (message: string, type?: ToastType) => void; } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [activeToasts, setActiveToasts] = useState<ToastProps[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
      setActiveToasts((prev) => [...prev, { message, type }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {activeToasts.map((toast, index) => (
        <Toast
          key={index}
          message={toast.message}
          type={toast.type}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast deve essere utilizzato all'interno di ToastProvider"
    );
  }

  return context;
}