import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  BookMarked,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  ArrowRight,
  RotateCcw,
  Library,
  CheckCheck,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { getMyReservations, cancelReservation } from '../../services/reservation.service';
import type { Reservation, Loan, ReservationStatus } from '../../types/reservations';
import { CATEGORY_LABELS, CATEGORY_COLORS, COVER_GRADIENTS } from '../../types/books';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import styles from './MyBooks.module.css';
import LoadingBox from '../../components/LoadingBox';
import ErrorBox from '../../components/ErrorBox';

type FilterTab = 'ALL' | 'PENDING' | 'APPROVED' | 'LOANS';

interface UnifiedItem {
  id: string;
  type: 'reservation' | 'loan';
  book: Reservation['book'];
  status: ReservationStatus | 'RETURNED';
  createdAt: string | Date;
  dateLabel: string;
  dueDate?: string | Date;
  returnedAt?: string | Date | null;
  rawReservation?: Reservation;
  rawLoan?: Loan;
}

export default function MyBooks() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const navigate = useNavigate();
  const location = useLocation();

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
        navigate('/login', { state: { from: location } });
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
    const activeLoans =
      loans.filter((l) => !l.returnedAt).length +
      reservations.filter((r) => r.status === 'FULFILLED').length;

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

  // Format date helper
  const formatDate = (dateVal: string | Date | undefined) => {
    if (!dateVal) return '-';
    try {
      const d = new Date(dateVal);
      return new Intl.DateTimeFormat('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return String(dateVal);
    }
  };

  // Due date status helper
  const getDueStatus = (dueDateVal?: string | Date) => {
    if (!dueDateVal) return null;
    const due = new Date(dueDateVal).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Scaduto da ${Math.abs(diffDays)} gg`, isOverdue: true };
    }
    if (diffDays <= 3) {
      return { text: `Scade tra ${diffDays} gg`, isNear: true };
    }
    return { text: `Scadenza: ${formatDate(dueDateVal)}`, isNormal: true };
  };

  // Status badge config renderer
  const renderStatusBadge = (status: ReservationStatus | 'RETURNED') => {
    switch (status) {
      case 'PENDING':
        return (
          <span className={`${styles.statusBadge} ${styles.statusPending}`}>
            <Clock size={12} />
            In attesa
          </span>
        );
      case 'APPROVED':
        return (
          <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
            <CheckCircle2 size={12} />
            Pronto al desk
          </span>
        );
      case 'FULFILLED':
        return (
          <span className={`${styles.statusBadge} ${styles.statusFulfilled}`}>
            <BookOpen size={12} />
            In prestito
          </span>
        );
      case 'RETURNED':
        return (
          <span className={`${styles.statusBadge} ${styles.statusReturned}`}>
            <CheckCheck size={12} />
            Restituito
          </span>
        );
      case 'REJECTED':
        return (
          <span className={`${styles.statusBadge} ${styles.statusRejected}`}>
            <AlertCircle size={12} />
            Non approvata
          </span>
        );
      case 'CANCELLED':
        return (
          <span className={`${styles.statusBadge} ${styles.statusCancelled}`}>
            <XCircle size={12} />
            Annullata
          </span>
        );
      default:
        return (
          <span className={`${styles.statusBadge} ${styles.statusCancelled}`}>
            {status}
          </span>
        );
    }
  };

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
          <section className={styles.itemsGrid} aria-label="Elenco libri prenotati e in prestito">
            {filteredItems.map((item) => {
              const book = item.book;
              const catColor = CATEGORY_COLORS[book.category] || CATEGORY_COLORS.OTHER;
              const gradient = COVER_GRADIENTS[book.category] || COVER_GRADIENTS.OTHER;
              const dueStatus = getDueStatus(item.dueDate);
              const isPending =
                item.type === 'reservation' &&
                item.rawReservation?.status === 'PENDING';
              const isCancelling =
                item.type === 'reservation' &&
                cancellingId === item.rawReservation?.id;

              return (
                <article key={item.id} className={styles.card}>
                  {/* Book Cover */}
                  <div className={styles.coverWrapper}>
                    {book.coverImagePath ? (
                      <img
                        src={book.coverImagePath}
                        alt={`Copertina di ${book.title}`}
                        className={styles.coverImg}
                      />
                    ) : (
                      <div
                        className={styles.coverFallback}
                        style={{ background: gradient }}
                      >
                        <div className={styles.coverFallbackPattern} />
                        <span className={styles.coverFallbackBrand}>Hubiblio</span>
                        <span className={styles.coverFallbackTitle}>{book.title}</span>
                        <span className={styles.coverFallbackAuthor}>{book.author}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Main Content */}
                  <div className={styles.cardContent}>
                    <div className={styles.cardTop}>
                      {/* Category & Status badges */}
                      <div className={styles.badgeRow}>
                        <span
                          className={styles.categoryTag}
                          style={{
                            background: catColor.bg,
                            color: catColor.text,
                            border: `1px solid ${catColor.border}`,
                          }}
                        >
                          {CATEGORY_LABELS[book.category] || book.category}
                        </span>

                        {renderStatusBadge(item.status)}
                      </div>

                      {/* Title & Author */}
                      <Link
                        to={`/books/${book.id}`}
                        className={styles.bookTitleLink}
                        title={book.title}
                      >
                        {book.title}
                      </Link>
                      <span className={styles.bookAuthor}>{book.author}</span>

                      {/* Meta Information & Dates */}
                      <div className={styles.metaBox}>
                        <div className={styles.metaItem}>
                          <Calendar size={13} />
                          <span>
                            {item.dateLabel}:{' '}
                            <span className={styles.metaItemStrong}>
                              {formatDate(item.createdAt)}
                            </span>
                          </span>
                        </div>

                        {item.dueDate && (
                          <div className={styles.metaItem}>
                            <Clock size={13} />
                            <span
                              className={
                                dueStatus?.isOverdue
                                  ? styles.overdueAlert
                                  : dueStatus?.isNear
                                  ? styles.dueAlert
                                  : ''
                              }
                            >
                              {dueStatus?.text}
                            </span>
                          </div>
                        )}

                        {item.returnedAt && (
                          <div className={styles.metaItem}>
                            <CheckCheck size={13} />
                            <span>
                              Restituito il:{' '}
                              <span className={styles.metaItemStrong}>
                                {formatDate(item.returnedAt)}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className={styles.cardActions}>
                      <Link to={`/books/${book.id}`} className={styles.detailBtn}>
                        <span>Scheda libro</span>
                        <ArrowRight size={13} />
                      </Link>

                      {isPending && item.rawReservation && (
                        <button
                          type="button"
                          className={styles.cancelBtn}
                          disabled={isCancelling}
                          onClick={() =>
                            handleCancelReservation(item.rawReservation!.id)
                          }
                          aria-label={`Annulla richiesta per ${book.title}`}
                        >
                          {isCancelling ? (
                            <>
                              <Loader2
                                size={12}
                                style={{ animation: 'spin 1s linear infinite' }}
                              />
                              <span>Annullamento...</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={13} />
                              <span>Annulla richiesta</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}