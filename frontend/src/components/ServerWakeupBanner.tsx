import { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, X } from 'lucide-react';
import { subscribeServerWakeup, checkServerHealth } from '../lib/api';
import styles from './ServerWakeupBanner.module.css';

export default function ServerWakeupBanner() {
  const [visible, setVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial server probe at application startup
  useEffect(() => {
    let active = true;
    const probeTimeout = setTimeout(async () => {
      // If the server doesn't respond to the probe within 2.5 seconds, show the banner
      if (!active) return;
      const ok = await checkServerHealth();
      if (!active) return;
      if (ok) {
        // If the probe was successful, the server is already awake
      }
    }, 2500);

    return () => {
      active = false;
      clearTimeout(probeTimeout);
    };
  }, []);

  // Listen to slow requests intercepted by apiFetch
  useEffect(() => {
    const unsubscribe = subscribeServerWakeup((isSlow, wasWakingUp) => {
      if (isSlow) {
        setIsReady(false);
        setIsExiting(false);
        setVisible(true);
        setElapsedSeconds(3); // starts from ~3s because it triggers after 2.5s
      } else if (wasWakingUp) {
        setIsReady(true);
        if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
        dismissTimeoutRef.current = setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            setVisible(false);
            setIsExiting(false);
          }, 350);
        }, 2200);
      }
    });

    return () => {
      unsubscribe();
      if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
    };
  }, []);

  // Counter of elapsed seconds
  useEffect(() => {
    if (visible && !isReady) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible, isReady]);

  if (!visible) return null;

  // Progress estimation for typical Render cold start (approx. 45 seconds)
  const estimatedProgress = Math.min(94, Math.round((elapsedSeconds / 45) * 100));

  return (
    <aside
      className={`${styles.banner} ${isReady ? styles.bannerReady : ''} ${
        isExiting ? styles.bannerExiting : ''
      }`}
      role="status"
      aria-live="polite"
      aria-label="Stato del server"
    >
      <div className={styles.contentRow}>
        <div className={`${styles.iconWrapper} ${isReady ? styles.iconReady : ''}`}>
          {isReady ? (
            <CheckCircle2 size={20} />
          ) : (
            <Loader2 size={20} className={styles.spinnerRotate} />
          )}
        </div>

        <div className={styles.textGroup}>
          <div className={styles.titleRow}>
            <h4 className={styles.title}>
              {isReady ? 'Server connesso e pronto!' : 'Avvio del server in corso...'}
            </h4>
            {!isReady && (
              <span className={styles.badgeTimer} aria-label={`Trascorsi ${elapsedSeconds} secondi`}>
                {elapsedSeconds}s
              </span>
            )}
          </div>

          <p className={styles.message}>
            {isReady
              ? 'Il backend ha risposto con successo. Puoi continuare a navigare!'
              : 'Il backend gratuito su Render è andato in pausa e si sta riavviando. L’operazione richiede circa 30-50 secondi.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => setVisible(false), 350);
          }}
          className={styles.closeBtn}
          aria-label="Chiudi notifica avvio server"
          title="Chiudi"
        >
          <X size={16} />
        </button>
      </div>

      <div className={styles.progressBarTrack}>
        <div
          className={`${styles.progressBarFill} ${isReady ? styles.progressBarReady : ''}`}
          style={{ width: isReady ? '100%' : `${Math.max(6, estimatedProgress)}%` }}
        />
      </div>
    </aside>
  );
}

