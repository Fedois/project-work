import type { Book, Category } from '../types/books';
import { apiFetch } from '../lib/api';

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

  const data = await apiFetch(url);
  return data.books;
}

export async function getBookById(id: string): Promise<Book> {
  const data = await apiFetch(`/api/books/${id}`);
  return data.book || data;
}
