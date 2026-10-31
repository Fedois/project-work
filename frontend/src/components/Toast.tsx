import { useEffect, useRef } from "react";
import { Check, X, Info } from "lucide-react";
import styles from "./Toast.module.css";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
    message: string;
    type: ToastType;
    duration?: number;
}

export default function Toast({ message, type, duration = 3500 }: ToastProps) {
    const toastRef = useRef<HTMLDivElement>(null);
    
    const color = {
        success: "#34d399",
        error: "#f87171",
        info: "#60a5fa",
    };

    const Icon = {
        success: Check,
        error: X,
        info: Info,
    };

    const CurrentIcon = Icon[type];

    useEffect(() => {
        const timer = setTimeout(() => {
            if(toastRef.current){
                toastRef.current.remove();
            }
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    return (
        <div ref={toastRef} className={styles.toastNotice} role="status" aria-live="polite">
            <CurrentIcon size={18} color={color[type]} />
            <span>{message}</span>
        </div>
    );
}
