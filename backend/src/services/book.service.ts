import { prisma } from "../lib/prisma.js";
import { Category, type Prisma } from "../generated/prisma/client.js";

type BookQuery = {
  search?: unknown;
  category?: unknown;
  sortBy?: unknown;
};

function getStringParam(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getAverageRating(feedbacks: { rating: number }[]): number | null {
  if (feedbacks.length === 0) {
    return null;
  }

  return feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length;
}

function getCategory(value: string): Category | undefined {
  const normalized = value.trim().toUpperCase();
  return Object.values(Category).find((category) => category === normalized);
}

export async function getBooks(query: BookQuery) {
  const search = getStringParam(query.search)?.trim();
  const categoryParam = getStringParam(query.category)?.trim();
  const sortBy = getStringParam(query.sortBy);

  const where: Prisma.BookWhereInput = {};

  // Search by title, author, description or category.
  if (search) {
    const orConditions: Prisma.BookWhereInput[] = [
      { title: { contains: search, mode: "insensitive" } },
      { author: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];

    const matchedCategory = getCategory(search);

    if (matchedCategory) {
      orConditions.push({ category: matchedCategory });
    }

    where.OR = orConditions;
  }

  // Filter by one or more categories separated by comma.
  if (categoryParam) {
    const categories = [
      ...new Set(
        categoryParam
          .split(",")
          .map(getCategory)
          .filter((category): category is Category => category !== undefined)
      ),
    ];

    if (categories.length === 1) {
      where.category = categories[0] as Category;
    } else if (categories.length > 1) {
      where.category = { in: categories as Category[] };
    }
  }

  // Default sorting: title ascending.
  let orderBy: Prisma.BookOrderByWithRelationInput = { title: "asc" };

  switch (sortBy) {
    case "title-desc":
      orderBy = { title: "desc" };
      break;

    case "year":
      orderBy = { publicationDate: "desc" };
      break;

    case "title-asc":
    default:
      orderBy = { title: "asc" };
      break;
  }

  const rawBooks = await prisma.book.findMany({
    where,
    orderBy,
    include: {
      feedbacks: true,
    },
  });

  let books = rawBooks.map((book) => ({ ...book, rating: getAverageRating(book.feedbacks) }));

  // Rating sorting is performed in memory.
  if (sortBy === "rating") {
    books = books.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }

  return { status: "ok" as const, count: books.length, books };
}

export async function getBookById(id: string | undefined) {
  if (!id) {
    return null;
  }

  const rawBook = await prisma.book.findUnique({
    where: { id },
    include: {
      feedbacks: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!rawBook) {
    return null;
  }

  return { status: "ok" as const, book: { ...rawBook, rating: getAverageRating(rawBook.feedbacks) } };
}