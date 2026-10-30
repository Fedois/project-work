import type { Book, BooksApiResponse, Category } from '../types/books';

export interface GetBooksParams {
  search?: string;
  category?: Category | Category[] | string;
  sortBy?: string;
}

export async function getBooks(params: GetBooksParams = {}): Promise<Book[]> {
  const query = new URLSearchParams();

  if (params.search && params.search.trim()) {
    query.set('search', params.search.trim());
  }

  if (params.category) {
    if (Array.isArray(params.category)) {
      if (params.category.length > 0) {
        query.set('category', params.category.join(','));
      }
    } else if (params.category.trim()) {
      query.set('category', params.category.trim());
    }
  }

  if (params.sortBy) {
    query.set('sortBy', params.sortBy);
  }

  const queryString = query.toString();
  const url = queryString ? `/api/books?${queryString}` : '/api/books';

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Errore nella richiesta (${res.status}): ${res.statusText}`);
  }

  const data: BooksApiResponse = await res.json();
  return data.books;
}

export async function getBookById(id: string): Promise<Book> {
  const res = await fetch(`/api/books/${id}`);
  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? 'Libro non trovato'
        : `Errore nel recupero del libro (${res.status}): ${res.statusText}`
    );
  }

  const data = await res.json();
  return data.book || data;
}
