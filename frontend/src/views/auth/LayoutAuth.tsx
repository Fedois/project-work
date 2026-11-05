import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../../components/Logo';
import styles from './LayoutAuth.module.css';

interface LayoutAuthProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function LayoutAuth({ title, subtitle, children }: LayoutAuthProps) {
  return (
    <main className={styles.authWrapper}>
      <Link to="/" className={styles.backHomeLink} aria-label="Torna alla Home">
        <ArrowLeft size={16} />
        <span>Torna alla home</span>
      </Link>

      <div className={styles.authCard}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <Link to="/" aria-label="Hubiblio Home">
              <Logo variant="default" size={26} />
            </Link>
          </div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {children}
      </div>
    </main>
  );
}