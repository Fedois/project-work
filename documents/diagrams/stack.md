## Stack tecnologico

Il diagramma mostra l'architettura tecnologica della webapp e mostra come i diversi livelli del isstema interagiscono tra loro: il frontend comunica tramite richieste HTTP con il backend, che si occupa della logica di business e dell'accesso ai dati tramite Prisma. I dati vengono poi persistiti nel database PostgreSQL gestito tramite Supabase

```mermaid
flowchart TB
    A["Frontend — React + Vite + TypeScript"] -- Richieste HTTP --> B("Backend — Node.js + Express + TypeScript<br>")
    B -- Risposte JSON --> A
    B -- Query tramite Prisma --> C[("Database — Supabase (PostgreSQL)")]
    C -- Risultati delle query --> B
    n1["Catalogo, In evidenza, Le mie prenotazioni, Pannello bibliotecario"]
    n2["Route, Middleware, Controller, Servizi, Accesso ai dati"]
    n3["Utenti, Libri, Prestiti, Prenotazioni, Feedback"]

    n1@{ shape: text}
    n2@{ shape: text}
    n3@{ shape: text}
    n1 --- A
    n2 --- B
    n3 --- C
```

### Architettura a tre livelli

```mermaid
flowchart TB
    subgraph ClientTier ["Livello di Presentazione (Frontend SPA)"]
        UI["Interfaccia Utente (React 19 + TypeScript + Vite)"]
        State["State Management (Context API: AuthContext, ToastContext)"]
        Routing["Client Routing (React Router v7 + ProtectedRoute RBAC)"]
        APIClient["API Client (apiFetch con Retry automatico e Wakeup listener)"]
        UI --- State
        UI --- Routing
        Routing --- APIClient
    end

    subgraph AppTier ["Livello Applicativo (Backend REST API)"]
        Server["Express Web Server (Node.js v24 + TypeScript)"]
        ProxyConf["Reverse Proxy Trust (app.set('trust proxy', 1))"]
        AuthMid["Security Middleware (authenticate, requireLibrarian, requireUserLogged)"]
        Controllers["Controller Layer (auth, book, reservation, admin)"]
        Services["Service Layer (business logic, transactions, token refresh)"]
        ORM["Prisma ORM Client (Type-Safe Database Access)"]
        Server --- ProxyConf
        Server --- AuthMid
        AuthMid --- Controllers
        Controllers --- Services
        Services --- ORM
    end

    subgraph DataTier ["Livello di Persistenza (Database & Identity)"]
        PG[("PostgreSQL Database (Supabase Cloud)")]
        AuthService[("Supabase Auth (JWT & Bcrypt Engine)")]
        ORM --- PG
        Services -.-> AuthService
    end

    APIClient -- "HTTPS / JSON Payload / HttpOnly Cookies" --> Server
    Server -- "HTTP 200/201/400/401/403/404 + Set-Cookie" --> APIClient
```