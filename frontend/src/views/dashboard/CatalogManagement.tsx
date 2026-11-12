import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { getBooks } from '../../services/book.service';
import {
  adminCreateBook,
  adminUpdateBook,
  adminDeleteBook,
  type BookFormData,
} from '../../services/admin.service';
import type { Book } from '../../types/books';
import { CATEGORY_LABELS } from '../../types/books';
import { useToast } from '../../context/ToastContext';
import styles from './Dashboard.module.css';

const EMPTY_FORM: BookFormData = {
  title: '',
  author: '',
  category: 'OTHER',
  isbn: '',
  publicationDate: '',
  quantity: 1,
  coverImagePath: '',
  description: '',
  pages: null,
};

export default function CatalogManagement() {
  const { showToast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState<BookFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBooks();
      setBooks(data);
    } catch (e: any) {
      showToast(e.message || 'Errore nel caricamento dei libri', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const openCreate = () => {
    setEditingBook(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn ?? '',
      publicationDate: book.publicationDate
        ? new Date(book.publicationDate).toISOString().slice(0, 10)
        : '',
      quantity: book.quantity,
      coverImagePath: book.coverImagePath ?? '',
      description: book.description ?? '',
      pages: book.pages ?? null,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.author || !form.category || !form.publicationDate) {
      showToast('Compila i campi obbligatori: titolo, autore, categoria, data', 'error');
      return;
    }
    try {
      setSaving(true);
      if (editingBook) {
        const updated = await adminUpdateBook(editingBook.id, form);
        setBooks((prev) => prev.map((b) => (b.id === editingBook.id ? { ...b, ...updated } : b)));
        showToast('Libro aggiornato con successo.', 'success');
      } else {
        const created = await adminCreateBook(form);
        setBooks((prev) => [created, ...prev]);
        showToast('Libro aggiunto con successo.', 'success');
      }
      setModalOpen(false);
    } catch (e: any) {
      showToast(e.message || 'Errore durante il salvataggio', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (book: Book) => {
    if (!window.confirm(`Eliminare il libro "${book.title}"? L'azione è irreversibile.`)) return;
    try {
      setDeletingId(book.id);
      await adminDeleteBook(book.id);
      setBooks((prev) => prev.filter((b) => b.id !== book.id));
      showToast('Libro eliminato.', 'info');
    } catch (e: any) {
      showToast(e.message || 'Impossibile eliminare il libro', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const setField = <K extends keyof BookFormData>(key: K, value: BookFormData[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div>
      {/* Header */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>
          <BookOpen size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          Libri nel catalogo ({books.length})
        </h3>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={openCreate}>
          <Plus size={15} />
          Aggiungi libro
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Libro</th>
              <th>Categoria</th>
              <th>ISBN</th>
              <th>Anno</th>
              <th>Copie</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className={styles.loadingRow}>
                <td colSpan={6}>Caricamento…</td>
              </tr>
            ) : books.length === 0 ? (
              <tr className={styles.loadingRow}>
                <td colSpan={6}>Nessun libro trovato</td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.id}>
                  <td>
                    <div className={styles.bookInfo}>
                      {book.coverImagePath ? (
                        <img
                          src={book.coverImagePath}
                          alt=""
                          className={styles.bookCover}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className={styles.bookCoverFallback} />
                      )}
                      <div>
                        <div className={styles.bookTitle}>{book.title}</div>
                        <div className={styles.bookAuthor}>{book.author}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgePending}`} style={{ background: '#ede9fe', color: '#7c3aed' }}>
                      {CATEGORY_LABELS[book.category]}
                    </span>
                  </td>
                  <td className={styles.textMuted}>{book.isbn || '—'}</td>
                  <td className={styles.textMuted}>
                    {book.publicationDate
                      ? new Date(book.publicationDate).getFullYear()
                      : '—'}
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        color: book.quantity === 0 ? '#dc2626' : '#059669',
                      }}
                    >
                      {book.quantity}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className={`${styles.btn} ${styles.btnOutline} ${styles.btnSmall}`}
                        onClick={() => openEdit(book)}
                      >
                        <Pencil size={12} />
                        Modifica
                      </button>
                      <button
                        className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`}
                        onClick={() => handleDelete(book)}
                        disabled={deletingId === book.id}
                      >
                        <Trash2 size={12} />
                        {deletingId === book.id ? '…' : 'Elimina'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Book Form Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>
              {editingBook ? 'Modifica libro' : 'Aggiungi nuovo libro'}
            </h2>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.formLabel}>Titolo *</label>
                <input
                  className={styles.formInput}
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  placeholder="Titolo del libro"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Autore *</label>
                <input
                  className={styles.formInput}
                  value={form.author}
                  onChange={(e) => setField('author', e.target.value)}
                  placeholder="Nome autore"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Categoria *</label>
                <select
                  className={styles.formSelect}
                  value={form.category}
                  onChange={(e) => setField('category', e.target.value)}
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>ISBN</label>
                <input
                  className={styles.formInput}
                  value={form.isbn ?? ''}
                  onChange={(e) => setField('isbn', e.target.value)}
                  placeholder="978-3-16-148410-0"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Anno di pubblicazione *</label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={form.publicationDate}
                  onChange={(e) => setField('publicationDate', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Quantità *</label>
                <input
                  type="number"
                  min={0}
                  className={styles.formInput}
                  value={form.quantity}
                  onChange={(e) => setField('quantity', Number(e.target.value))}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Pagine</label>
                <input
                  type="number"
                  min={1}
                  className={styles.formInput}
                  value={form.pages ?? ''}
                  onChange={(e) =>
                    setField('pages', e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="es. 320"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.formLabel}>URL copertina</label>
                <input
                  className={styles.formInput}
                  value={form.coverImagePath ?? ''}
                  onChange={(e) => setField('coverImagePath', e.target.value)}
                  placeholder="https://…"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.formLabel}>Descrizione</label>
                <textarea
                  className={styles.formTextarea}
                  value={form.description ?? ''}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Breve descrizione del libro…"
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                className={`${styles.btn} ${styles.btnOutline}`}
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Annulla
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Salvataggio…' : editingBook ? 'Salva modifiche' : 'Aggiungi libro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

