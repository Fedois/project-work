// Types
export type Category =
  | 'FANTASY'
  | 'THRILLER'
  | 'HORROR'
  | 'DRAMA'
  | 'COMEDY'
  | 'ACTION'
  | 'ADVENTURE'
  | 'SCI_FI'
  | 'MYSTERY'
  | 'ROMANCE'
  | 'BUSINESS'
  | 'OTHER';

export interface Feedback {
  id: string;
  rating: number;
  comment: string | null;
  title?: string | null;
  bookId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string | Date;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
  coverImagePath?: string | null;
  publicationDate?: Date | string | null;
  quantity: number;
  category: Category;
  description?: string | null;
  pages?: number | null;
  rating?: number | null;
  feedbacks?: Feedback[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// API response shape
export interface BooksApiResponse {
  status: string;
  count: number;
  books: Book[];
}

// UI helpers
export const CATEGORY_LABELS: Record<Category, string> = {
  FANTASY:   'Fantasy',
  THRILLER:  'Thriller',
  HORROR:    'Horror',
  DRAMA:     'Dramma',
  COMEDY:    'Commedia',
  ACTION:    'Azione',
  ADVENTURE: 'Avventura',
  SCI_FI:    'Fantascienza',
  MYSTERY:   'Mistero',
  ROMANCE:   'Romanzo',
  BUSINESS:  'Business',
  OTHER:     'Altro',
};

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string }> = {
  FANTASY:   { bg: 'rgb(98 114 245 / 0.1)',  text: '#4c55e9', border: 'rgb(98 114 245 / 0.3)' },
  THRILLER:  { bg: 'rgb(239 68 68 / 0.1)',   text: '#dc2626', border: 'rgb(239 68 68 / 0.3)' },
  HORROR:    { bg: 'rgb(107 33 168 / 0.1)',  text: '#7e22ce', border: 'rgb(107 33 168 / 0.3)' },
  DRAMA:     { bg: 'rgb(251 191 36 / 0.15)', text: '#b45309', border: 'rgb(251 191 36 / 0.4)' },
  COMEDY:    { bg: 'rgb(16 185 129 / 0.1)',  text: '#047857', border: 'rgb(16 185 129 / 0.3)' },
  ACTION:    { bg: 'rgb(249 115 22 / 0.1)',  text: '#c2410c', border: 'rgb(249 115 22 / 0.3)' },
  ADVENTURE: { bg: 'rgb(20 184 166 / 0.1)',  text: '#0f766e', border: 'rgb(20 184 166 / 0.3)' },
  SCI_FI:    { bg: 'rgb(6 182 212 / 0.1)',   text: '#0e7490', border: 'rgb(6 182 212 / 0.3)' },
  MYSTERY:   { bg: 'rgb(99 102 241 / 0.1)',  text: '#4338ca', border: 'rgb(99 102 241 / 0.3)' },
  ROMANCE:   { bg: 'rgb(244 114 182 / 0.1)', text: '#be185d', border: 'rgb(244 114 182 / 0.3)' },
  BUSINESS:  { bg: 'rgb(52 211 153 / 0.1)',  text: '#065f46', border: 'rgb(52 211 153 / 0.3)' },
  OTHER:     { bg: 'rgb(148 163 184 / 0.1)', text: '#475569', border: 'rgb(148 163 184 / 0.3)' },
};

export const COVER_GRADIENTS: Record<Category, string> = {
  FANTASY:   'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  THRILLER:  'linear-gradient(135deg, #2d3561 0%, #c05c7e 100%)',
  HORROR:    'linear-gradient(135deg, #1a1a2e 0%, #6b2d6b 100%)',
  DRAMA:     'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  COMEDY:    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  ACTION:    'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  ADVENTURE: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  SCI_FI:    'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  MYSTERY:   'linear-gradient(135deg, #373b44 0%, #4286f4 100%)',
  ROMANCE:   'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  BUSINESS:  'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
  OTHER:     'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)',
};
