import styles from './ErrorBox.module.css'
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function ErrorBox({error, fetchData}: {error: string, fetchData: () => void}) {
    return (
      <main className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.stateCard}>
            <div
              className={styles.stateIconWrap}
              style={{ background: '#fef2f2', color: '#dc2626' }}
            >
              <AlertTriangle size={32} />
            </div>
            <h2 className={styles.stateTitle}>Si è verificato un errore</h2>
            <p className={styles.stateSubtitle}>{error}</p>
            <button type="button" onClick={fetchData} className={styles.primaryActionBtn}>
              <RotateCcw size={16} />
              Riprova
            </button>
          </div>
        </div>
      </main>
    );
}