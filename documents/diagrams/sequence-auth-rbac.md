## Diagramma di Sequenza: Autenticazione e Controllo degli Accessi (RBAC)

Questo diagramma illustra come il sistema applicativo gestisce l'accesso alle risorse protette, verificando l'identità dell'utente e impedendo l'accesso non autorizzato a rotte o API riservate (es. un utente con ruolo `MEMBER` che tenta di accedere alla `/dashboard` o alle API `/api/admin/*`).

```mermaid
sequenceDiagram
    autonumber
    actor Utente as Utente (MEMBER o LIBRARIAN)
    participant Browser as Browser Client
    participant Router as React Router (ProtectedRoute)
    participant Backend as Express API Server
    participant Middleware as auth.middleware (authenticate / requireLibrarian)
    participant Supa as Supabase Auth (Auth Server)
    participant DB as Database (PostgreSQL / Prisma)

    %% Scenario 1: Login & Emissione Token HttpOnly
    Note over Utente, DB: SCENARIO 1: Autenticazione & Rilascio Credenziali Sicure
    Utente->>Browser: Inserisce credenziali (email, password)
    Browser->>Backend: POST /api/auth/login { email, password }
    Backend->>Supa: signInWithPassword({ email, password })
    Supa-->>Backend: Token JWT (access_token, refresh_token)
    Backend->>DB: prisma.user.findUnique({ email })
    DB-->>Backend: Dati Utente & Ruolo (es. MEMBER o LIBRARIAN)
    Backend-->>Browser: 200 OK + Set-Cookie: sb_access_token (HttpOnly, Secure, SameSite: Lax)
    Browser-->>Utente: Login completato, stato memorizzato in AuthContext

    %% Scenario 2: Tentativo di Accesso a Risorsa Amministrativa da parte di MEMBER
    Note over Utente, DB: SCENARIO 2: Tentativo non autorizzato da parte di un MEMBER
    alt Accesso da Interfaccia Utente (URL /dashboard)
        Utente->>Browser: Digita manualmente "/dashboard"
        Browser->>Router: Valuta ProtectedRoute (allowedRoles: ['LIBRARIAN', 'ADMIN'])
        Router->>Router: Verifica user.role == 'MEMBER'
        Router-->>Browser: Accesso negato a livello Client -> Redirect immediato a "/"
    else Chiamata Diretta API (es. tramite Postman / fetch su /api/admin/books)
        Utente->>Backend: POST /api/admin/books { ... } (Cookie sb_access_token)
        Backend->>Middleware: authenticate(req, res, next)
        Middleware->>Supa: Verifica validità firma token JWT
        Supa-->>Middleware: Token valido, payload decodificato
        Middleware->>DB: prisma.user.findUnique(id)
        DB-->>Middleware: user: { id: "...", role: "MEMBER" }
        Middleware->>Backend: res.locals.user = user
        Backend->>Middleware: requireLibrarian(req, res, next)
        Middleware->>Middleware: Controllo: user.role !== 'LIBRARIAN' && user.role !== 'ADMIN'
        Middleware-->>Utente: HTTP 403 Forbidden { status: "error", message: "Accesso negato: richiesto ruolo LIBRARIAN o ADMIN" }
    end

    %% Scenario 3: Accesso Autorizzato da parte di LIBRARIAN
    Note over Utente, DB: SCENARIO 3: Accesso Autorizzato da parte di un LIBRARIAN
    Utente->>Browser: Clicca su "Dashboard" (visibile solo a LIBRARIAN)
    Browser->>Router: Valuta ProtectedRoute (allowedRoles: ['LIBRARIAN', 'ADMIN'])
    Router->>Router: Verifica user.role == 'LIBRARIAN' -> Autorizzato!
    Browser-->>Utente: Rendering del layout Dashboard (Sidebar, Panoramica, Catalogo...)
    Browser->>Backend: GET /api/admin/stats (Cookie sb_access_token)
    Backend->>Middleware: authenticate & requireLibrarian
    Middleware-->>Backend: Accesso garantito (200 OK)
    Backend->>DB: Conteggio libri, iscritti, prestiti e prenotazioni in attesa
    DB-->>Backend: Dati aggregati
    Backend-->>Browser: JSON con metriche statistiche
    Browser-->>Utente: Visualizzazione delle Stat Card aggiornate in tempo reale
```

