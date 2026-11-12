import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  BookMarked,
  Clock,
  CheckCircle2,
  Library,
} from 'lucide-react';
import { getMyReservations, cancelReservation } from '../../services/reservation.service';
import type { Reservation, Loan, UnifiedItem } from '../../types/reservations';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import styles from './MyBooks.module.css';
import LoadingBox from '../../components/LoadingBox';
import ErrorBox from '../../components/ErrorBox';
import BooksLoansSection from './BooksLoansSection';

export default function MyBooks() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'LOANS'>('ALL');

  const fetchData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true);
      setError(null);
      const data = await getMyReservations();
      setReservations(data.reservations || []);
      setLoans(data.loans || []);
    } catch (err: any) {
      console.error('Errore nel recupero delle prenotazioni:', err);
      setError(err.message || 'Impossibile caricare le tue prenotazioni.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchData();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading, fetchData]);

  // Handle cancellation of a pending reservation
  const handleCancelReservation = async (reservationId: string) => {
    if (!window.confirm('Sei sicuro di voler annullare questa richiesta di prenotazione?')) {
      return;
    }

    try {
      setCancellingId(reservationId);
      const updated = await cancelReservation(reservationId);
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status: updated.status } : r))
      );
      showToast('Prenotazione annullata con successo.', 'info');
    } catch (err: any) {
      console.error('Errore durante l’annullamento:', err);
      showToast(err.message || 'Errore durante l’annullamento della prenotazione', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  // Build unified item list for clean rendering and filtering (reservations and loans)
  const unifiedItems: UnifiedItem[] = useMemo(() => {
    const list: UnifiedItem[] = [];

    // Map loans
    loans.forEach((loan) => {
      const isReturned = !!loan.returnedAt;
      list.push({
        id: `loan-${loan.id}`,
        type: 'loan',
        book: loan.book,
        status: isReturned ? 'RETURNED' : 'FULFILLED',
        createdAt: loan.loanDate,
        dateLabel: 'Inizio prestito',
        dueDate: loan.dueDate,
        returnedAt: loan.returnedAt,
        rawLoan: loan,
      });
    });

    // Map reservations (avoid duplicate if reservation was already fulfilled and appears in loans)
    const loanedBookIds = new Set(loans.map((l) => l.bookId));

    reservations.forEach((res) => {
      // If already fulfilled and in loans, we don't need duplicate card unless user wants history
      if (res.status === 'FULFILLED' && loanedBookIds.has(res.bookId)) {
        return;
      }

      list.push({
        id: `res-${res.id}`,
        type: 'reservation',
        book: res.book,
        status: res.status,
        createdAt: res.createdAt,
        dateLabel: 'Richiesto il',
        rawReservation: res,
      });
    });

    // Sort by most recent
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [reservations, loans]);

  // Counts for filters and stats
  const counts = useMemo(() => {
    const pending = reservations.filter((r) => r.status === 'PENDING').length;
    const approved = reservations.filter((r) => r.status === 'APPROVED').length;
    const activeLoans = loans.filter((l) => !l.returnedAt).length

    return {
      total: unifiedItems.length,
      pending,
      approved,
      activeLoans,
    };
  }, [reservations, loans, unifiedItems]);

  // Filtered list
  const filteredItems = useMemo(() => {
    return unifiedItems.filter((item) => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'PENDING') return item.status === 'PENDING';
      if (activeFilter === 'APPROVED') return item.status === 'APPROVED';
      if (activeFilter === 'LOANS') return item.status === 'FULFILLED';
      return true;
    });
  }, [unifiedItems, activeFilter]);

  // If initial load
  if (loading || authLoading) {
    return <LoadingBox title="Caricamento dei tuoi prestiti..." text="Stiamo recuperando i dettagli delle tue prenotazioni dal database della biblioteca." />
  }

  // If error occurred
  if (error) {
    return <ErrorBox error={error} fetchData={fetchData} />
  }

  return (
    <main className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* ── Page Header ────────────────────────────────────── */}
        <header className={styles.headerSection}>
          <div className={styles.titleArea}>
            <span className={styles.badgeHeader}>
              <Library size={14} />
              Area Personale Lettore
            </span>
            <h1 className={styles.pageTitle}>I miei libri e prenotazioni</h1>
            <p className={styles.pageSubtitle}>
              Controlla lo stato delle tue richieste di prestito, i volumi pronti per il ritiro
              presso il desk e le scadenze dei libri in corso di lettura.
            </p>
          </div>

          {/* ── Summary Stats and filter ───────────────────────────────── */}
          <div className={styles.statsGrid}>
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'ALL'}
              className={`${styles.statCard} ${activeFilter === 'ALL' ? styles.filterTabActive : ''}`}
              onClick={() => setActiveFilter('ALL')}
            >
              <div
                className={styles.statIconWrap}
                style={{ background: 'var(--brand-100)', color: 'var(--brand-700)' }}
              >
                <BookMarked size={22} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{counts.total}</span>
                <span className={styles.statLabel}>Totale richieste</span>
              </div>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'PENDING'}
              className={`${styles.statCard} ${activeFilter === 'PENDING' ? styles.filterTabActive : ''}`}
              onClick={() => setActiveFilter('PENDING')}
            >
              <div
                className={styles.statIconWrap}
                style={{ background: '#fef3c7', color: '#b45309' }}
              >
                <Clock size={22} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{counts.pending}</span>
                <span className={styles.statLabel}>In attesa di conferma</span>
              </div>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'APPROVED'}
              className={`${styles.statCard} ${activeFilter === 'APPROVED' ? styles.filterTabActive : ''}`}
              onClick={() => setActiveFilter('APPROVED')}
            >
              <div
                className={styles.statIconWrap}
                style={{ background: '#d1fae5', color: '#047857' }}
              >
                <CheckCircle2 size={22} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{counts.approved}</span>
                <span className={styles.statLabel}>Pronte al desk</span>
              </div>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === 'LOANS'}
              className={`${styles.statCard} ${activeFilter === 'LOANS' ? styles.filterTabActive : ''}`}
              onClick={() => setActiveFilter('LOANS')}
            >
              <div
                className={styles.statIconWrap}
                style={{ background: '#e0e7ff', color: '#4338ca' }}
              >
                <BookOpen size={22} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{counts.activeLoans}</span>
                <span className={styles.statLabel}>Prestiti attivi</span>
              </div>
            </button>
          </div>
        </header>

        {/* ── Items List / Grid ───────────────────────────────── */}
        {filteredItems.length === 0 ? (
          <div className={styles.stateCard}>
            <div className={styles.stateIconWrap}>
              <BookMarked size={32} />
            </div>
            <h2 className={styles.stateTitle}>
              {counts.total === 0 ? 'Nessun libro prenotato o in prestito' : 'Nessun volume trovato'}
            </h2>
            <p className={styles.stateSubtitle}>
              {counts.total === 0
                ? 'Non hai ancora inviato richieste di prestito. Esplora il catalogo di Hubiblio e prenota il tuo prossimo libro in pochi istanti.'
                : 'Nessuna prenotazione o prestito corrisponde al filtro selezionato. Prova a selezionare un’altra categoria o torna a tutti i libri.'}
            </p>
            {counts.total === 0 ? (
              <Link to="/#catalog" className={styles.primaryActionBtn}>
                <BookOpen size={16} />
                Esplora il catalogo
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setActiveFilter('ALL')}
                className={styles.primaryActionBtn}
              >
                Mostra tutti i volumi
              </button>
            )}
          </div>
        ) : (
          <BooksLoansSection filteredItems={filteredItems} handleCancelReservation={handleCancelReservation} cancellingId={cancellingId} />
        )}
      </div>
    </main>
  );
}