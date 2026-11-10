import styles from "./BooksLoansCard.module.css";
import { CATEGORY_LABELS, CATEGORY_COLORS, COVER_GRADIENTS } from '../../types/books';
import type { ReservationStatus, UnifiedItem } from '../../types/reservations';
import { Calendar, Clock, CheckCircle2, BookOpen, CheckCheck, AlertCircle, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface BooksLoansCardProps {
    filteredItems: UnifiedItem[];
    handleCancelReservation: (id: string) => void;
    cancellingId: string | null;
}

export default function BooksLoansSection({filteredItems, handleCancelReservation, cancellingId}: BooksLoansCardProps){
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

    return (
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
    )
}