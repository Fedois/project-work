## Diagramma di Sequenza: Ciclo di Vita Prenotazione e Prestito

Questo diagramma illustra lo scenario end-to-end che collega la richiesta di prenotazione inviata dall'utente (`MEMBER`) con la gestione, approvazione ed evasione in prestito da parte del bibliotecario (`LIBRARIAN`), fino alla restituzione finale con ripristino della copia disponibile.

```mermaid
sequenceDiagram
    autonumber
    actor Utente as Utente (MEMBER)
    participant UI as Frontend (React UI)
    participant API as Backend (Express API)
    participant Auth as Auth Middleware
    participant Service as Admin & Reservation Services
    participant DB as Database (PostgreSQL / Prisma)
    actor Biblio as Bibliotecario (LIBRARIAN)

    %% Fase 1: Creazione Prenotazione
    Note over Utente, DB: FASE 1: Invio Richiesta Prenotazione
    Utente->>UI: Clicca su "Prenota questo libro"
    UI->>API: POST /api/reservations { bookId } (Cookie HttpOnly)
    API->>Auth: authenticate + requireUserLogged
    Auth-->>API: Utente autenticato (res.locals.user)
    API->>Service: createOrUpdateReservation(userId, bookId)
    Service->>DB: prisma.reservation.create({ status: 'PENDING' })
    DB-->>Service: Reservation creata (status: PENDING)
    Service-->>API: 200 OK + dati prenotazione
    API-->>UI: Risposta JSON
    UI-->>Utente: Mostra Toast di conferma & stato "In attesa"

    %% Fase 2: Approvazione da parte del Bibliotecario
    Note over Biblio, DB: FASE 2: Gestione & Approvazione
    Biblio->>UI: Accede alla Dashboard -> Tab "Prenotazioni"
    UI->>API: GET /api/admin/reservations?status=PENDING
    API->>Auth: authenticate + requireLibrarian
    Auth-->>API: Ruolo verificato (LIBRARIAN/ADMIN)
    API->>Service: adminGetAllReservations('PENDING')
    Service->>DB: prisma.reservation.findMany(...)
    DB-->>Service: Lista prenotazioni
    Service-->>API: 200 OK + lista
    API-->>UI: Risposta JSON
    UI-->>Biblio: Visualizza lista richieste in sospeso
    Biblio->>UI: Clicca "Approva"
    UI->>API: PATCH /api/admin/reservations/:id/status { status: 'APPROVED' }
    API->>Auth: authenticate + requireLibrarian
    API->>Service: adminUpdateReservationStatus(id, 'APPROVED')
    Service->>DB: prisma.reservation.update(status: 'APPROVED')
    DB-->>Service: Reservation aggiornata
    Service-->>API: 200 OK
    API-->>UI: Notifica esito
    UI-->>Biblio: Badge aggiornato a "Approvata"

    %% Fase 3: Evasione e Creazione Prestito
    Note over Biblio, DB: FASE 3: Ritiro al Desk & Registrazione Prestito (Transazione Atomica)
    Biblio->>UI: Clicca "Registra prestito" ed imposta data di scadenza (dueDate)
    UI->>API: POST /api/admin/reservations/:id/fulfill { dueDate }
    API->>Auth: authenticate + requireLibrarian
    API->>Service: adminFulfillReservation(reservationId, dueDate)
    Note over Service, DB: prisma.$transaction ([Loan.create, Reservation.update, Book.update])
    Service->>DB: 1. INSERT INTO Loan (userId, bookId, dueDate, loanDate)<br/>2. UPDATE Reservation SET status = 'FULFILLED'<br/>3. UPDATE Book SET quantity = quantity - 1
    DB-->>Service: Commit Transazione completato con successo
    Service-->>API: 201 Created + Loan creato
    API-->>UI: Risposta JSON
    UI-->>Biblio: Toast successo & redirect automatico al tab "Prestiti"

    %% Fase 4: Restituzione del Libro
    Note over Biblio, DB: FASE 4: Restituzione del Volume (Transazione Atomica)
    Biblio->>UI: Clicca "Registra restituzione" sul prestito attivo
    UI->>API: PATCH /api/admin/loans/:id/return
    API->>Auth: authenticate + requireLibrarian
    API->>Service: adminReturnLoan(loanId)
    Note over Service, DB: prisma.$transaction ([Loan.update, Book.update])
    Service->>DB: 1. UPDATE Loan SET returnedAt = now()<br/>2. UPDATE Book SET quantity = quantity + 1
    DB-->>Service: Commit Transazione
    Service-->>API: 200 OK + Loan aggiornato
    API-->>UI: Risposta JSON
    UI-->>Biblio: Badge "Restituito" & copie disponibili ripristinate a catalogo
```

