import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import type { Category } from "../src/generated/prisma/client.js";

const connectionString = process.env.DIRECT_URL;
if (!connectionString) throw new Error("DIRECT_URL non è configurata");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

interface BookSeed {
  title: string;
  author: string;
  publicationDate: Date;
  quantity: number;
  category: Category;
  description?: string;
  pages?: number;
}

const books: BookSeed[] = [
  {
    title: "Il Nome della Rosa",
    author: "Umberto Eco",
    publicationDate: new Date(1980, 0, 1),
    quantity: 3,
    category: "MYSTERY",
    description:
      "Un thriller medievale ambientato in un monastero del XIV secolo, dove una serie di misteriose morti sconvolge la comunità monastica.",
    pages: 502,
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    publicationDate: new Date(1965, 0, 1),
    quantity: 5,
    category: "SCI_FI",
    description:
      "Un capolavoro della fantascienza ambientato su Arrakis, il pianeta desertico dove si produce la preziosa spezia melange.",
    pages: 688,
  },
  {
    title: "Il Signore degli Anelli",
    author: "J.R.R. Tolkien",
    publicationDate: new Date(1954, 0, 1),
    quantity: 4,
    category: "FANTASY",
    description:
      "L'epica avventura di Frodo Baggins e dei suoi compagni nella Terra di Mezzo per distruggere l'Unico Anello.",
    pages: 1178,
  },
  {
    title: "La Ragazza con il Drago Tatuato",
    author: "Stieg Larsson",
    publicationDate: new Date(2005, 0, 1),
    quantity: 2,
    category: "THRILLER",
    description:
      "Un giornalista investigativo e una hacker ribelle si uniscono per risolvere il caso di una ragazza scomparsa quarant'anni fa.",
    pages: 672,
  },
  {
    title: "1984",
    author: "George Orwell",
    publicationDate: new Date(1949, 0, 1),
    quantity: 6,
    category: "SCI_FI",
    description:
      "Una distopia oscura che descrive una società totalitaria dominata da Grande Fratello, dove ogni pensiero è controllato.",
    pages: 328,
  },
  {
    title: "Shining",
    author: "Stephen King",
    publicationDate: new Date(1977, 0, 1),
    quantity: 2,
    category: "HORROR",
    description:
      "Jack Torrance porta la famiglia nell'isolato Overlook Hotel per l'inverno, ma le forze soprannaturali del posto minacciano di distruggerli.",
    pages: 447,
  },
  {
    title: "Orgoglio e Pregiudizio",
    author: "Jane Austen",
    publicationDate: new Date(1813, 0, 1),
    quantity: 4,
    category: "ROMANCE",
    description:
      "La storia d'amore tra Elizabeth Bennet e il fiero Mr. Darcy nell'Inghilterra del XIX secolo, tra convenzioni sociali e sentimenti profondi.",
    pages: 432,
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    publicationDate: new Date(2011, 0, 1),
    quantity: 7,
    category: "OTHER",
    description:
      "Una breve storia dell'umanità che esplora come la nostra specie ha dominato il pianeta grazie a miti condivisi e collaborazione.",
    pages: 443,
  },
  {
    title: "La Trilogia di Bartimeus",
    author: "Jonathan Stroud",
    publicationDate: new Date(2003, 0, 1),
    quantity: 3,
    category: "FANTASY",
    description:
      "Bartimeus è un djinn sarcastico invocato da un giovane mago nella Londra alternativa governata da maghi e spiriti.",
    pages: 512,
  },
  {
    title: "Il Codice Da Vinci",
    author: "Dan Brown",
    publicationDate: new Date(2003, 0, 1),
    quantity: 5,
    category: "THRILLER",
    description:
      "Robert Langdon si trova coinvolto in un'avventura che rivela i segreti di una antica società e il vero significato di opere d'arte celebri.",
    pages: 561,
  },
  {
    title: "Neuromante",
    author: "William Gibson",
    publicationDate: new Date(1984, 0, 1),
    quantity: 2,
    category: "SCI_FI",
    description:
      "Il romanzo fondatore del cyberpunk che ha introdotto il concetto di cyberspazio e ha ispirato decenni di narrativa fantascientifica.",
    pages: 271,
  },
  {
    title: "I Miserabili",
    author: "Victor Hugo",
    publicationDate: new Date(1862, 0, 1),
    quantity: 3,
    category: "DRAMA",
    description:
      "L'epopea di Jean Valjean, un ex galeotto che cerca redenzione nella Francia del XIX secolo, inseguito dall'inflessibile ispettore Javert.",
    pages: 1463,
  },
  {
    title: "L'Alchimista",
    author: "Paulo Coelho",
    publicationDate: new Date(1988, 0, 1),
    quantity: 8,
    category: "ADVENTURE",
    description:
      "Santiago, un giovane pastore andaluso, intraprende un viaggio verso le piramidi d'Egitto seguendo la sua Leggenda Personale.",
    pages: 197,
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    publicationDate: new Date(2011, 0, 1),
    quantity: 4,
    category: "BUSINESS",
    description:
      "Il Premio Nobel per l'Economia esplora i due sistemi di pensiero che guidano le nostre scelte e i bias cognitivi che ci influenzano.",
    pages: 499,
  },
  {
    title: "It",
    author: "Stephen King",
    publicationDate: new Date(1986, 0, 1),
    quantity: 3,
    category: "HORROR",
    description:
      "A Derry, una piccola città del Maine, sette bambini affrontano un'entità soprannaturale che si manifesta sotto forma di paure.",
    pages: 1138,
  },
  {
    title: "Harry Potter e la Pietra Filosofale",
    author: "J.K. Rowling",
    publicationDate: new Date(1997, 0, 1),
    quantity: 10,
    category: "FANTASY",
    description:
      "Un ragazzo scopre di essere un mago e inizia la sua avventura alla Scuola di Magia e Stregoneria di Hogwarts.",
    pages: 309,
  },
];

async function main() {
  console.log("🌱 Avvio seed...");

  const result = await prisma.book.createMany({ data: books });
  console.log(`  ✓ ${result.count} libri inseriti con successo`);
}

main()
  .catch((error) => {
    console.error("❌ Errore durante il seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
