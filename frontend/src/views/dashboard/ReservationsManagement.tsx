import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, CheckCircle2, XCircle, Ban, BookMarked } from 'lucide-react';
import {
  adminGetReservations,
  adminUpdateReservationStatus,
  adminFulfillReservation,
  type AdminReservation,
} from '../../services/admin.service';
import type { ReservationStatus } from '../../types/reservations';
import { RESERVATION_STATUS_CONFIG } from '../../types/reservations';
import { useToast } from '../../context/ToastContext';
import styles from './Dashboard.module.css';

type FilterStatus = 'ALL' | ReservationStatus;

const STATUS_BADGE_CLASS: Record<ReservationStatus, string> = {
  PENDING: styles.badgePending,
  APPROVED: styles.badgeApproved,
  FULFILLED: styles.badgeFulfilled,
  REJECTED: styles.badgeRejected,
  CANCELLED: styles.badgeCancelled,
};

interface FulfillState {
  reservationId: string;
  dueDate: string;
}

interface Props {
  onNavigateToLoans: () => void;
}

export default function ReservationsManagement({ onNavigateToLoans }: Props) {
  const { showToast } = useToast();
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [fulfillState, setFulfillState] = useState<FulfillState | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const status = filterStatus === 'ALL' ? undefined : filterStatus;
      const data = await adminGetReservations(status);
      setReservations(data);
    } catch (e: any) {
      showToast(e.message || 'Errore nel caricamento', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      const updated = await adminUpdateReservationStatus(id, newStatus);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
      );
      showToast(`Prenotazione aggiornata con successo`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Errore aggiornamento', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleFulfill = async () => {
    if (!fulfillState?.dueDate) {
      showToast('Specifica la data di scadenza del prestito', 'error');
      return;
    }
    try {
      setUpdatingId(fulfillState.reservationId);
      await adminFulfillReservation(fulfillState.reservationId, fulfillState.dueDate);
      showToast('Prestito registrato con successo! La prenotazione è completata, il libro è in prestito.', 'success');
      setFulfillState(null);
      await fetchReservations();
      onNavigateToLoans();
    } catch (e: any) {
      showToast(e.message || 'Errore nella creazione del prestito', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filters: { label: string; value: FilterStatus }[] = [
    { label: 'Tutte', value: 'ALL' },
    { label: 'In attesa', value: 'PENDING' },
    { label: 'Approvate', value: 'APPROVED' },
    { label: 'Evase', value: 'FULFILLED' },
    { label: 'Rifiutate', value: 'REJECTED' },
    { label: 'Annullate', value: 'CANCELLED' },
  ];

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>
          <ClipboardList
            size={16}
            style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }}
          />
          Prenotazioni ({reservations.length})
        </h3>
        <button
          className={`${styles.btn} ${styles.btnOutline} ${styles.btnSmall}`}
          onClick={fetchReservations}
        >
          Aggiorna
        </button>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterRow}>
        {filters.map((f) => (
          <button
            key={f.value}
            className={`${styles.filterBtn} ${filterStatus === f.value ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterStatus(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Libro</th>
              <th>Utente</th>
              <th>Stato</th>
              <th>Data richiesta</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className={styles.loadingRow}>
                <td colSpan={5}>Caricamento…</td>
              </tr>
            ) : reservations.length === 0 ? (
              <tr className={styles.loadingRow}>
                <td colSpan={5}>Nessuna prenotazione trovata</td>
              </tr>
            ) : (
              reservations.map((res) => (
                <tr key={res.id}>
                  <td>
                    <div className={styles.bookInfo}>
                      {res.book.coverImagePath ? (
                        <img src={res.book.coverImagePath} alt="" className={styles.bookCover} />
                      ) : (
                        <div className={styles.bookCoverFallback} />
                      )}
                      <div>
                        <div className={styles.bookTitle}>{res.book.title}</div>
                        <div className={styles.bookAuthor}>{res.book.author}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.bookTitle}>
                      {res.user.firstName} {res.user.lastName}
                    </div>
                    <div className={styles.bookAuthor}>{res.user.email}</div>
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${STATUS_BADGE_CLASS[res.status]}`}
                    >
                      {RESERVATION_STATUS_CONFIG[res.status].label}
                    </span>
                  </td>
                  <td className={styles.textMuted}>
                    {new Date(res.createdAt).toLocaleDateString('it-IT')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {/* PENDING → APPROVED */}
                      {res.status === 'PENDING' && (
                        <button
                          className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSmall}`}
                          disabled={updatingId === res.id}
                          onClick={() => handleStatusChange(res.id, 'APPROVED')}
                        >
                          <CheckCircle2 size={12} />
                          Approva
                        </button>
                      )}

                      {/* PENDING / APPROVED → REJECTED */}
                      {(res.status === 'PENDING' || res.status === 'APPROVED') && (
                        <button
                          className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`}
                          disabled={updatingId === res.id}
                          onClick={() => handleStatusChange(res.id, 'REJECTED')}
                        >
                          <XCircle size={12} />
                          Rifiuta
                        </button>
                      )}

                      {/* PENDING / APPROVED → CANCELLED */}
                      {(res.status === 'PENDING' || res.status === 'APPROVED') && (
                        <button
                          className={`${styles.btn} ${styles.btnOutline} ${styles.btnSmall}`}
                          disabled={updatingId === res.id}
                          onClick={() => handleStatusChange(res.id, 'CANCELLED')}
                        >
                          <Ban size={12} />
                          Annulla
                        </button>
                      )}

                      {/* APPROVED → FULFILLED (crea prestito) */}
                      {res.status === 'APPROVED' && (
                        <button
                          className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
                          disabled={updatingId === res.id}
                          onClick={() =>
                            setFulfillState({
                              reservationId: res.id,
                              dueDate: '',
                            })
                          }
                        >
                          <BookMarked size={12} />
                          Registra prestito
                        </button>
                      )}

                      {updatingId === res.id && (
                        <span className={styles.textMuted}>Aggiornamento…</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Fulfill Modal */}
      {fulfillState && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => e.target === e.currentTarget && setFulfillState(null)}
        >
          <div className={styles.modal} style={{ maxWidth: 400 }}>
            <h2 className={styles.modalTitle}>Registra prestito</h2>
            <p style={{ color: '#6b7280', fontSize: '.88rem', margin: '0 0 20px' }}>
              Specifica la data entro cui il libro deve essere restituito. Verrà creato un prestito
              e la prenotazione sarà marcata come <strong>FULFILLED</strong>.
            </p>
            <div className={styles.formGroup} style={{ marginBottom: 8 }}>
              <label className={styles.formLabel}>Data di scadenza *</label>
              <input
                type="date"
                className={styles.formInput}
                min={new Date().toISOString().slice(0, 10)}
                value={fulfillState.dueDate}
                onChange={(e) =>
                  setFulfillState((prev) => prev && { ...prev, dueDate: e.target.value })
                }
              />
            </div>
            <div className={styles.formActions}>
              <button
                className={`${styles.btn} ${styles.btnOutline}`}
                onClick={() => setFulfillState(null)}
              >
                Annulla
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleFulfill}
                disabled={!!updatingId}
              >
                {updatingId ? 'Registrazione…' : 'Conferma prestito'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

