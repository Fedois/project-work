import styles from './Logo.module.css';
import { BookOpen } from "lucide-react";

interface LogoProps {
    variant: 'default' | 'footer';
    size?: number;
}

export default function Logo({variant, size}: LogoProps){
    return(
        <div className={styles.logo} aria-label="Hubiblio">
           <div className={styles.logoIcon}>
            <BookOpen size={size || 20} strokeWidth={2.2} />
          </div>
          <span className={variant === 'footer' ? styles.logoTextSecondary : styles.logoText}>Hubiblio</span>
        </div>
    );
}