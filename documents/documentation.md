# Documentazione Tecnica del Prototipo e Scenari d'Uso

La presente sezione documenta l'architettura tecnica, il modello dati, i casi d'uso e gli scenari operativi del prototipo sviluppato per la piattaforma di gestione bibliotecaria **Hubiblio**, in conformità con i requisiti del Project Work nell'area scientifico-disciplinare **INF/01 (Informatica)**.

---

## 1. Architettura di Sistema e Stack Tecnologico

Il sistema adotta un'architettura **client-server a tre livelli (Three-Tier Architecture)**, separando nettamente il livello di presentazione, la logica applicativa e il livello di memorizzazione persistente:

1. **Livello di Presentazione (Frontend Web):** Realizzato come Single Page Application (SPA) reattiva con **React 19**, **Vite** e **TypeScript**, stilizzata mediante CSS Modules nativi.
2. **Livello Applicativo (Backend & API RESTful):** Server REST sviluppato con **Node.js**, **Express** e **TypeScript**, responsabile della logica di business, dell'autenticazione, della validazione dell'input e dell'autorizzazione basata sui ruoli (RBAC).
3. **Livello dei Dati (Storage & Database Relazionale):** Database **PostgreSQL** ospitato su infrastruttura cloud **Supabase**, interfacciato dal backend attraverso l'Object-Relational Mapping (ORM) **Prisma** con client tipizzato.

### 1.1 Concetti di Elaborazione, Memorizzazione e Comunicazione (INF/01)

- **Elaborazione:** Distribuita tra client (rendering dichiarativo, gestione dello stato con React Context, filtri dinamici lato visualizzazione) e server (elaborazione delle regole di business, autorizzazione crittografica delle sessioni, aggregazione analitica dei dati).
- **Memorizzazione:** La persistenza garantisce proprietà **ACID** (Atomicità, Coerenza, Isolamento, Durabilità). I dati transazionali (es. evasione di una prenotazione con emissione prestito e decremento copie) vengono eseguiti all'interno di blocchi transazionali atomici (`prisma.$transaction`).
- **Comunicazione:** Avviene su protocollo HTTP/HTTPS mediante API REST stateless. L'autenticazione e la persistenza dell'identità sono delegate a **Cookie HttpOnly (`sb_access_token`)** con policy `SameSite: Lax`, proteggendo l'applicazione da attacchi di tipo Cross-Site Scripting (XSS) e manomissione client-side dei token JWT emessi da Supabase Auth.

```mermaid
flowchart TB
    A["Frontend — React 19 + Vite + TypeScript"] -- "Richieste HTTP (Cookie HttpOnly / JSON)" --> B("Backend — Node.js + Express + TypeScript")
    B -- "Risposte HTTP (JSON / HTTP Status Code)" --> A
    B -- "Query & Transazioni tramite Prisma ORM" --> C[("Database — Supabase (PostgreSQL)")]
    C -- "Record set / Risultati strutturati" --> B

    n1["Interfaccia Utente: Catalogo, Scheda Libro, Le mie prenotazioni, Dashboard"]
    n2["Logica Server: Routing REST, Middleware Auth & RBAC, Controller, Service Layer"]
    n3["Modello Dati: Utenti, Libri, Prestiti, Prenotazioni, Feedback"]

    n1@{ shape: text}
    n2@{ shape: text}
    n3@{ shape: text}
    n1 --- A
    n2 --- B
    n3 --- C
```

---

## 2. Modello dei Dati (Diagramma Entità-Relazione)

La base di dati relazionale modella i processi cardine dell'impresa culturale: la catalogazione del patrimonio librario, l'anagrafica utenti, il ciclo di vita delle prenotazioni, la gestione dei prestiti e la raccolta di recensioni/feedback.

```mermaid
erDiagram
	direction TB
	User {
		text id PK "Identificativo univoco (UUID / CUID)"
		text firstName "Nome dell'utente"
		text lastName "Cognome dell'utente"
		text email "Indirizzo email univoco"
		UserRole role "MEMBER, LIBRARIAN, ADMIN"
		timestamp createdAt "Data registrazione"
		timestamp updatedAt "Ultimo aggiornamento"
	}

	Book {
		text id PK "Identificativo univoco libro"
		text title "Titolo dell'opera"
		text author "Autore o curatore"
		text isbn "Codice ISBN univoco (opzionale)"
		int4 quantity "Numero di copie disponibili a scaffale"
		Category category "Genere/Categoria letteraria"
		timestamp publicationDate "Data di pubblicazione"
		text coverImagePath "URL copertina libro"
		text description "Sinossi o descrizione estesa"
		int4 pages "Numero di pagine"
		timestamp createdAt "Data inserimento a catalogo"
		timestamp updatedAt "Ultima modifica"
	}

	Reservation {
		text id PK "Identificativo prenotazione"
		ReservationStatus status "PENDING, APPROVED, FULFILLED, REJECTED, CANCELLED"
		timestamp createdAt "Data di invio richiesta"
		timestamp updatedAt "Data cambio di stato"
		text userId FK "Riferimento a User (onDelete: Restrict)"
		text bookId FK "Riferimento a Book (onDelete: Restrict)"
	}

	Loan {
		text id PK "Identificativo prestito"
		timestamp loanDate "Data inizio prestito"
		timestamp dueDate "Data di scadenza prevista per la riconsegna"
		timestamp returnedAt "Data effettiva di restituzione (Nullable)"
		text userId FK "Riferimento a User (onDelete: Restrict)"
		text bookId FK "Riferimento a Book (onDelete: Restrict)"
		timestamp createdAt "Data registrazione prestito"
	}

	Feedback {
		text id PK "Identificativo recensione"
		int4 rating "Valutazione numerica (1 - 5 stelle)"
		text title "Titolo della recensione (opzionale)"
		text comment "Testo descrittivo del feedback (opzionale)"
		text bookId FK "Riferimento a Book (onDelete: Cascade)"
		text userId FK "Riferimento a User (onDelete: Cascade)"
		timestamp createdAt "Data pubblicazione"
	}

	User ||--o{ Loan : "effettua"
	Book ||--o{ Loan : "riguarda"
	User ||--o{ Reservation : "effettua"
	Book ||--o{ Reservation : "riguarda"
	User ||--o{ Feedback : "scrive"
	Book ||--o{ Feedback : "riceve"
```

### 2.1 Integrità Referenziale e Vincoli di Dominio
- **Vincoli `onDelete: Restrict` su `Reservation` e `Loan`:** Impediscono la cancellazione accidentale di un volume o di un utente fintanto che sussistono contratti di prestito o prenotazioni in essere.
- **Vincolo `onDelete: Cascade` su `Feedback`:** Qualora un libro o un utente vengano definitivamente rimossi, le recensioni collegate vengono rimosse a cascata per prevenire record orfani.
- **Enumeratori:**
  - `UserRole`: `MEMBER`, `LIBRARIAN`, `ADMIN`.
  - `ReservationStatus`: `PENDING` (richiesta inviata), `APPROVED` (accettata, volume pronto al desk), `FULFILLED` (ritirato e commutato in prestito), `REJECTED` (rifiutata dal bibliotecario), `CANCELLED` (annullata dal lettore).
  - `Category`: `FANTASY`, `THRILLER`, `HORROR`, `DRAMA`, `COMEDY`, `ACTION`, `ADVENTURE`, `SCI_FI`, `MYSTERY`, `ROMANCE`, `BUSINESS`, `OTHER`.

---

## 3. Diagramma Generale dei Casi d'Uso (Use Case Diagram)

Il sistema supporta tre profili di utenza, ciascuno con specifiche autorizzazioni:
- **Visitatore (Guest):** Consultazione anonima del catalogo, ricerca e registrazione/login.
- **Iscritto (Member):** Prenotazione volumi, gestione delle proprie richieste, visualizzazione prestiti attivi e invio di feedback/recensioni.
- **Bibliotecario / Amministratore (Librarian / Admin):** Gestione completa del catalogo (CRUD), approvazione/rifiuto prenotazioni, formalizzazione dei prestiti al banco, registrazione restituzioni e monitoraggio analitico (KPI).

```mermaid
flowchart LR
    Guest["Visitatore (Non autenticato)"]
    Member["Iscritto (Ruolo MEMBER)"]
    Librarian["Bibliotecario (LIBRARIAN / ADMIN)"]

    subgraph AuthSys ["Autenticazione & Profilo"]
        UC_Reg["Registrazione account"]
        UC_Login["Accesso / Login"]
        UC_Logout["Disconnessione"]
    end

    subgraph CatalogSys ["Catalogo & Feedback"]
        UC_Browse["Consultazione catalogo & filtri"]
        UC_ViewDetail["Visualizzazione scheda libro & copie"]
        UC_Feedback["Pubblicazione recensione (1-5 stelle)"]
    end

    subgraph MemberSys ["Area Personale Lettore"]
        UC_Reserve["Richiesta prenotazione (PENDING)"]
        UC_ViewMyBooks["Monitoraggio prenotazioni & scadenze"]
        UC_CancelRes["Annullamento prenotazione personale"]
    end

    subgraph AdminSys ["Dashboard Bibliotecario"]
        UC_Stats["Monitoraggio KPI e Statistiche"]
        UC_ManageCatalog["CRUD Catalogo (Aggiunta, Modifica, Rimozione protetta)"]
        UC_ApproveReject["Approvazione / Rifiuto prenotazioni"]
        UC_FulfillLoan["Registrazione prestito da prenotazione (FULFILLED)"]
        UC_ReturnLoan["Registrazione restituzione & reintegro copia"]
    end

    Guest --> UC_Browse
    Guest --> UC_ViewDetail
    Guest --> UC_Reg
    Guest --> UC_Login

    Member --> UC_Browse
    Member --> UC_ViewDetail
    Member --> UC_Logout
    Member --> UC_Feedback
    Member --> UC_Reserve
    Member --> UC_ViewMyBooks
    Member --> UC_CancelRes

    Librarian --> UC_Logout
    Librarian --> UC_Stats
    Librarian --> UC_ManageCatalog
    Librarian --> UC_ApproveReject
    Librarian --> UC_FulfillLoan
    Librarian --> UC_ReturnLoan
```

---

## 4. Scenari d'Uso Dettagliati e Diagrammi di Sequenza

### 4.1 Scenario d'Uso 1: Autenticazione e Controllo degli Accessi (RBAC)

* **Attori:** Utente con ruolo `MEMBER`, Utente con ruolo `LIBRARIAN`.
* **Pre-condizioni:** L'utente accede alla piattaforma.
* **Descrizione del Flusso:**
  1. L'utente invia credenziali via `POST /api/auth/login`.
  2. Il server valida le credenziali con Supabase Auth e legge il profilo su PostgreSQL; se valido, deposita il cookie crittografato `sb_access_token` nel browser.
  3. Il frontend (`AuthContext`) aggiorna l'identità dell'utente. Se l'utente è un `LIBRARIAN`, nella Navbar compare il link "Dashboard".
  4. Se un utente `MEMBER` tenta di forzare l'URL `/dashboard`, il componente React `ProtectedRoute` intercetta la violazione tramite la prop `allowedRoles={['LIBRARIAN', 'ADMIN']}` e reindirizza immediatamente il browser alla Home (`/`).
  5. Se un client malevolo tenta di interrogare direttamente le API `/api/admin/*`, la catena di middleware `authenticate` + `requireLibrarian` risponde con codice HTTP `403 Forbidden`.

```mermaid
sequenceDiagram
    autonumber
    actor Utente as Utente (MEMBER o LIBRARIAN)
    participant UI as React Router (ProtectedRoute)
    participant API as Express API Server
    participant Mid as Middleware (authenticate / requireLibrarian)
    participant DB as PostgreSQL (Prisma)

    Utente->>API: POST /api/auth/login { email, password }
    API->>DB: Verifica credenziali & recupero ruolo (MEMBER / LIBRARIAN)
    API-->>Utente: HTTP 200 OK + Cookie HttpOnly (sb_access_token)

    alt Tentativo di accesso non autorizzato (Utente MEMBER su rotta /dashboard)
        Utente->>UI: Naviga su "/dashboard"
        UI->>UI: Verifica allowedRoles: ['LIBRARIAN', 'ADMIN']
        UI-->>Utente: Accesso negato: Redirect automatico alla Home ("/")
    else Chiamata diretta API non autorizzata da parte di MEMBER
        Utente->>API: GET /api/admin/stats
        API->>Mid: authenticate
        Mid-->>API: Utente autenticato (role: 'MEMBER')
        API->>Mid: requireLibrarian
        Mid-->>Utente: HTTP 403 Forbidden {"status": "error", "message": "Accesso negato"}
    else Accesso autorizzato (Utente LIBRARIAN)
        Utente->>UI: Naviga su "/dashboard"
        UI-->>Utente: Rendering del layout Dashboard
        UI->>API: GET /api/admin/stats
        API->>Mid: authenticate & requireLibrarian (OK)
        API->>DB: Query metriche aggregate
        DB-->>API: Dati statistici
        API-->>UI: HTTP 200 OK { totalBooks, activeLoans, overdueLoans, ... }
        UI-->>Utente: Visualizzazione Stat Card
    end
```

---

### 4.2 Scenario d'Uso 2: Ciclo di Vita Prenotazione, Evasione in Prestito e Restituzione

* **Attori:** Utente Iscritto (`MEMBER`), Bibliotecario (`LIBRARIAN`).
* **Pre-condizioni:** Libro presente a catalogo; utente autenticato.
* **Descrizione del Flusso:**
  1. **Invio richiesta:** L'utente apre la scheda libro (`/books/:id`) e clicca su "Prenota questo libro". Il backend crea un record `Reservation` con stato `PENDING`.
  2. **Approvazione:** Il bibliotecario consulta la sezione "Prenotazioni" della Dashboard, riscontra la disponibilità della copia e clicca "Approva". Lo stato transita ad `APPROVED`.
  3. **Ritiro al banco & Evasione:** L'utente si reca in biblioteca. Il bibliotecario clicca "Registra prestito", inserisce la data di scadenza (default: 30 giorni) e conferma.
  4. **Transazione Atomica ($transaction):**
     - Viene inserito un record `Loan` con `loanDate: now()` e `dueDate`.
     - La `Reservation` collegata viene aggiornata a stato `FULFILLED`.
     - La disponibilità del volume (`Book.quantity`) viene decrementata di 1.
  5. **Restituzione:** Alla riconsegna fisica del libro, il bibliotecario clicca "Registra restituzione" nella sezione "Prestiti". Una transazione atomica imposta `returnedAt: now()` e incrementa nuovamente `Book.quantity` di 1.

```mermaid
sequenceDiagram
    autonumber
    actor Utente as Lettore (MEMBER)
    participant UI as Frontend (React UI)
    participant API as Backend (Express API)
    participant Service as Admin / Reservation Services
    participant DB as PostgreSQL (Prisma)
    actor Biblio as Bibliotecario (LIBRARIAN)

    Note over Utente, DB: FASE 1: Prenotazione da parte del Lettore
    Utente->>UI: Clicca "Prenota questo libro"
    UI->>API: POST /api/reservations { bookId }
    API->>Service: createOrUpdateReservation(userId, bookId)
    Service->>DB: INSERT INTO Reservation (status = 'PENDING')
    DB-->>Service: Reservation creata
    Service-->>API: 200 OK
    API-->>UI: Notifica esito
    UI-->>Utente: Stato aggiornato: "In attesa di approvazione"

    Note over Biblio, DB: FASE 2: Approvazione da Dashboard
    Biblio->>UI: Visualizza richiesta nel tab "Prenotazioni" e clicca "Approva"
    UI->>API: PATCH /api/admin/reservations/:id/status { status: 'APPROVED' }
    API->>Service: adminUpdateReservationStatus(id, 'APPROVED')
    Service->>DB: UPDATE Reservation SET status = 'APPROVED'
    DB-->>Service: Record aggiornato
    Service-->>API: 200 OK
    API-->>UI: Aggiornamento UI
    UI-->>Biblio: Badge aggiornato a "Approvata"

    Note over Biblio, DB: FASE 3: Evasione al Desk -> Registrazione Prestito (Transazione Atomica)
    Biblio->>UI: Clicca "Registra prestito" ed inserisce data di scadenza (dueDate)
    UI->>API: POST /api/admin/reservations/:id/fulfill { dueDate }
    API->>Service: adminFulfillReservation(reservationId, dueDate)
    Note over Service, DB: prisma.$transaction ([Loan.create, Reservation.update, Book.update])
    Service->>DB: 1. INSERT INTO Loan (userId, bookId, dueDate, loanDate)<br/>2. UPDATE Reservation SET status = 'FULFILLED'<br/>3. UPDATE Book SET quantity = quantity - 1
    DB-->>Service: Transazione committata con successo
    Service-->>API: 201 Created
    API-->>UI: Risposta JSON
    UI-->>Biblio: Conferma prestito creato & redirect al tab "Prestiti"

    Note over Biblio, DB: FASE 4: Restituzione del Libro (Transazione Atomica)
    Biblio->>UI: Clicca "Registra restituzione"
    UI->>API: PATCH /api/admin/loans/:id/return
    API->>Service: adminReturnLoan(loanId)
    Note over Service, DB: prisma.$transaction ([Loan.update, Book.update])
    Service->>DB: 1. UPDATE Loan SET returnedAt = now()<br/>2. UPDATE Book SET quantity = quantity + 1
    DB-->>Service: Transazione committata
    Service-->>API: 200 OK
    API-->>UI: Risposta JSON
    UI-->>Biblio: Stato prestito "Restituito", giacenza copia ripristinata
```

---

### 4.3 Scenario d'Uso 3: Gestione del Catalogo da parte del Bibliotecario

* **Attori:** Bibliotecario (`LIBRARIAN` o `ADMIN`).
* **Pre-condizioni:** Accesso eseguito con privilegi amministrativi.
* **Descrizione del Flusso:**
  1. Il bibliotecario seleziona la sezione "Catalogo" della Dashboard.
  2. **Aggiunta Volume:** Cliccando su "Aggiungi libro", si apre un form modale che richiede titolo, autore, genere (`Category`), codice ISBN, anno di pubblicazione, numero di pagine, quantità disponibile, descrizione e URL della copertina.
  3. L'invio genera una richiesta `POST /api/admin/books`, memorizzando la nuova scheda nel database.
  4. **Modifica Volume:** Cliccando su "Modifica", il modale viene precompilato con i dati attuali; al salvataggio viene invocata la rotta `PATCH /api/admin/books/:id`.
  5. **Cancellazione Protetta:** Se il bibliotecario tenta di eliminare un libro, il servizio applicativo verifica prima che non vi siano prestiti non restituiti (`returnedAt: null`) o prenotazioni attive (`PENDING` o `APPROVED`). In caso di conflitti, l'eliminazione viene respinta con apposito messaggio di errore, garantendo l'integrità del patrimonio e dei contratti in essere.

---

### 4.4 Scenario d'Uso 4: Consultazione Catalogo e Invio Recensioni (Feedback)

* **Attori:** Visitatore (lettura) o Iscritto `MEMBER` (lettura e invio recensione).
* **Descrizione del Flusso:**
  1. L'utente naviga la Home Page o il Catalogo filtrando per parola chiave, categoria o ordinamento (per titolo, anno o valutazione media).
  2. Cliccando su un volume, accede alla pagina di dettaglio (`/books/:id`) che espone la disponibilità, la scheda bibliografica e le recensioni storiche aggregate.
  3. Se autenticato, l'utente può compilare il box di recensione selezionando un punteggio da 1 a 5 stelle, un titolo e un commento testuale.
  4. L'invio invoca `POST /api/books/new-feedback`, protetta dai middleware `authenticate` e `requireUserLogged`.
  5. Il backend registra il record `Feedback` associandolo all'ID utente verificato e ricalcola la media aggregata mostrata dinamicamente nell'interfaccia.

---

## 5. Specifiche delle API RESTful

La tabella seguente riassume l'interfaccia di comunicazione esposta dal backend:

| Metodo | Endpoint | Ruolo Richiesto | Descrizione |
|---|---|---|---|
| `POST` | `/api/auth/register` | Pubblico | Registrazione di un nuovo lettore (`MEMBER`) |
| `POST` | `/api/auth/login` | Pubblico | Autenticazione e rilascio cookie HttpOnly |
| `POST` | `/api/auth/logout` | Autenticato | Revoca della sessione e cancellazione cookie |
| `GET` | `/api/auth/me` | Autenticato | Ritorna il profilo dell'utente loggato |
| `GET` | `/api/books` | Pubblico | Ricerca e consultazione catalogo con filtri |
| `GET` | `/api/books/:id` | Pubblico | Scheda dettagliata del singolo volume e recensioni |
| `POST` | `/api/books/new-feedback` | Autenticato (`MEMBER`) | Invio di valutazione e commento |
| `POST` | `/api/reservations` | Autenticato (`MEMBER`) | Creazione nuova richiesta di prenotazione |
| `GET` | `/api/reservations/my` | Autenticato (`MEMBER`) | Elenco prenotazioni e prestiti personali |
| `GET` | `/api/reservations/check/:bookId` | Autenticato (`MEMBER`) | Verifica stato prenotazione per un dato libro |
| `PATCH` | `/api/reservations/:id/cancel` | Autenticato (`MEMBER`) | Annullamento di una prenotazione `PENDING`/`APPROVED` |
| `GET` | `/api/admin/stats` | `LIBRARIAN` / `ADMIN` | Metriche sintetiche dashboard (KPI) |
| `POST` | `/api/admin/books` | `LIBRARIAN` / `ADMIN` | Inserimento nuovo libro a catalogo |
| `PATCH` | `/api/admin/books/:id` | `LIBRARIAN` / `ADMIN` | Aggiornamento metadati di un libro |
| `DELETE` | `/api/admin/books/:id` | `LIBRARIAN` / `ADMIN` | Eliminazione libro (con controllo prestiti attivi) |
| `GET` | `/api/admin/reservations` | `LIBRARIAN` / `ADMIN` | Elenco di tutte le prenotazioni con filtro stato |
| `PATCH` | `/api/admin/reservations/:id/status` | `LIBRARIAN` / `ADMIN` | Modifica stato prenotazione (`APPROVED`, `REJECTED`, ecc.) |
| `POST` | `/api/admin/reservations/:id/fulfill` | `LIBRARIAN` / `ADMIN` | Evasione prenotazione con creazione prestito |
| `GET` | `/api/admin/loans` | `LIBRARIAN` / `ADMIN` | Elenco generale dei prestiti (attivi, scaduti, restituiti) |
| `PATCH` | `/api/admin/loans/:id/return` | `LIBRARIAN` / `ADMIN` | Registrazione restituzione e reintegro scorta |

---

## 6. Mappatura dei Test Funzionali e Riscontri Visivi (Screenshot)

A supporto della verifica del corretto funzionamento degli scenari sopra descritti, la documentazione include gli screenshot conservati nella cartella `documents/screenshots/`:

| Scenario di Test | Descrizione e Funzionalità Verificata | File Screenshot Correlato |
|---|---|---|
| **Home Page & Vetrina** | Consultazione del catalogo, libri in evidenza e filtri di ricerca | `home.png` |
| **Dettaglio Libro & Feedback** | Scheda volume, calcolo dinamico rating medio e modulo recensioni | `bookDetail.png` |
| **Azione Prenotazione loading** | Interfaccia mostra loading durante l'invio della prenotazione | `sendReserving.png` |
| **Prenotazione in attesa** | Interfaccia mostra la prenotazione in attesa di approvazione | `reservationPending.png` |
| **Prenotazione approvata** | Interfaccia mostra la prenotazione del libro approvata | `reservationApproved.png` |
| **Libro in prestito** | Interfaccia mostra il libro attualmente in prestito | `reservationFulfilled.png` |
| **Autenticazione & Accesso** | Moduli di registrazione nuovo utente e login sicuro | `register.png`, `login.png` |
| **Navbar & Ruoli Utente** | Visualizzazione dinamica delle opzioni in base al ruolo (`MEMBER` vs `LIBRARIAN`) | `navbarMember.png`, `navbarLibrarian.png` |
| **Area Personale Iscritto** | Sezione "I miei libri" con storico prenotazioni, stati e prestiti in corso | `myBooks.png` |
| **Dashboard Bibliotecario (KPI)** | Panoramica sintetica con 5 indicatori chiave (libri, iscritti, prestiti, scadenze) | `dashboard.png` |
| **Gestione Catalogo (CRUD)** | Tabella libri con azioni di modifica e rimozione protetta | `catalogManagement.png` |
| **Nuovo Volume a Catalogo** | Modale per l'aggiunta di un libro con campi bibliografici e giacenza | `addNewBooksModal.png` |
| **Modifica Volume a Catalogo** | Modale per la modifica di un libro con campi bibliografici e giacenza | `editBookModal.png` |
| **Gestione Prenotazioni** | Interfaccia per approvare, rifiutare ed evadere le prenotazioni degli utenti | `reservationsManagement.png` |
| **Monitoraggio Prestiti** | Elenco prestiti attivi, scaduti e gestione restituzione al desk | `loansManegement.png` |

