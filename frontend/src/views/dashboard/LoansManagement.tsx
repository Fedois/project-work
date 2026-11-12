import { useState, useEffect, useCallback } from 'react';
import { BookMarked, AlertTriangle, RotateCcw } from 'lucide-react';
import { adminGetLoans, adminReturnLoan, type AdminLoan } from '../../services/admin.service';
import { useToast } from '../../context/ToastContext';
import styles from './Dashboard.module.css';

type FilterType = 'ALL' | 'ACTIVE' | 'OVERDUE' | 'RETURNED';

export default function LoansManagement() {
  const { showToast } = useToast();
  const [loans, setLoans] = useState<AdminLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [returningId, setReturningId] = useState<string | null>(null);

  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminGetLoans();
      setLoans(data);
    } catch (e: any) {
      showToast(e.message || 'Errore nel caricamento dei prestiti', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleReturn = async (loan: AdminLoan) => {
    if (
      !window.confirm(
        `Registrare la restituzione di "${loan.book.title}" da parte di ${loan.user.firstName} ${loan.user.lastName}?`
      )
    )
      return;
    try {
      setReturningId(loan.id);
      const updated = await adminReturnLoan(loan.id);
      setLoans((prev) => prev.map((l) => (l.id === loan.id ? { ...l, ...updated } : l)));
      showToast('Restituzione registrata con successo.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Errore durante la restituzione', 'error');
    } finally {
      setReturningId(null);
    }
  };

  const now = new Date();

  const filteredLoans = loans.filter((loan) => {
    const returned = !!loan.returnedAt;
    const overdue = !returned && new Date(loan.dueDate) < now;
    if (filter === 'ACTIVE') return !returned && !overdue;
    if (filter === 'OVERDUE') return overdue;
    if (filter === 'RETURNED') return returned;
    return true;
  });

  const counts = {
    all: loans.length,
    active: loans.filter((l) => !l.returnedAt && new Date(l.dueDate) >= now).length,
    overdue: loans.filter((l) => !l.returnedAt && new Date(l.dueDate) < now).length,
    returned: loans.filter((l) => !!l.returnedAt).length,
  };

  const filters: { label: string; value: FilterType; count: number }[] = [
    { label: 'Tutti', value: 'ALL', count: counts.all },
    { label: 'Attivi', value: 'ACTIVE', count: counts.active },
    { label: 'Scaduti', value: 'OVERDUE', count: counts.overdue },
    { label: 'Restituiti', value: 'RETURNED', count: counts.returned },
  ];

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>
          <BookMarked
            size={16}
            style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }}
          />
          Prestiti ({loans.length})
        </h3>
        <button
          className={`${styles.btn} ${styles.btnOutline} ${styles.btnSmall}`}
          onClick={fetchLoans}
        >
          Aggiorna
        </button>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterRow}>
        {filters.map((f) => (
          <button
            key={f.value}
            className={`${styles.filterBtn} ${filter === f.value ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
            {f.count > 0 && (
              <span
                style={{
                  marginLeft: 5,
                  background: filter === f.value ? 'rgba(255,255,255,.25)' : '#e5e7eb',
                  borderRadius: 100,
                  padding: '0 6px',
                  fontSize: '.7rem',
                  fontWeight: 700,
                  color: filter === f.value ? '#fff' : '#374151',
                }}
              >
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Libro</th>
              <th>Utente</th>
              <th>Data prestito</th>
              <th>Scadenza</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className={styles.loadingRow}>
                <td colSpan={6}>Caricamento…</td>
              </tr>
            ) : filteredLoans.length === 0 ? (
              <tr className={styles.loadingRow}>
                <td colSpan={6}>Nessun prestito trovato per il filtro selezionato</td>
              </tr>
            ) : (
              filteredLoans.map((loan) => {
                const isReturned = !!loan.returnedAt;
                const isOverdue = !isReturned && new Date(loan.dueDate) < now;

                return (
                  <tr key={loan.id}>
                    <td>
                      <div className={styles.bookInfo}>
                        {loan.book.coverImagePath ? (
                          <img src={loan.book.coverImagePath} alt="" className={styles.bookCover} />
                        ) : (
                          <div className={styles.bookCoverFallback} />
                        )}
                        <div>
                          <div className={styles.bookTitle}>{loan.book.title}</div>
                          <div className={styles.bookAuthor}>{loan.book.author}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.bookTitle}>
                        {loan.user.firstName} {loan.user.lastName}
                      </div>
                      <div className={styles.bookAuthor}>{loan.user.email}</div>
                    </td>
                    <td className={styles.textMuted}>
                      {new Date(loan.loanDate).toLocaleDateString('it-IT')}
                    </td>
                    <td>
                      <span
                        style={{
                          color: isOverdue ? '#dc2626' : '#374151',
                          fontWeight: isOverdue ? 700 : 400,
                          fontSize: '.83rem',
                        }}
                      >
                        {isOverdue && <AlertTriangle size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
                        {new Date(loan.dueDate).toLocaleDateString('it-IT')}
                      </span>
                    </td>
                    <td>
                      {isReturned ? (
                        <span className={`${styles.badge} ${styles.badgeReturned}`}>Restituito</span>
                      ) : isOverdue ? (
                        <span className={`${styles.badge} ${styles.badgeOverdue}`}>Scaduto</span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeApproved}`}>Attivo</span>
                      )}
                    </td>
                    <td>
                      {!isReturned && (
                        <button
                          className={`${styles.btn} ${styles.btnOutline} ${styles.btnSmall}`}
                          disabled={returningId === loan.id}
                          onClick={() => handleReturn(loan)}
                        >
                          <RotateCcw size={12} />
                          {returningId === loan.id ? 'Registrazione…' : 'Registra restituzione'}
                        </button>
                      )}
                      {isReturned && loan.returnedAt && (
                        <span className={styles.textMuted}>
                          {new Date(loan.returnedAt).toLocaleDateString('it-IT')}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

