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
---
config:
  flowchart:
    nodeSpacing: 15
    rankSpacing: 18
    padding: 6
---
flowchart LR
    subgraph ClientTier["Livello di Presentazione<br>(Frontend SPA)"]
        UI["Interfaccia Utente<br>(React 19 +<br>TypeScript + Vite)"]
        State["State Management<br>(Context API:<br>AuthContext,<br>ToastContext)"]
        Routing["Client Routing<br>(React Router v7 +<br>ProtectedRoute RBAC)"]
        APIClient["API Client<br>(apiFetch)"]
    end

    subgraph AppTier["Livello Applicativo<br>(Backend REST API)"]
        Server["Express Web Server<br>(Node.js v24 +<br>TypeScript)"]
        ProxyConf["Reverse Proxy Trust<br>(app.set(<br>'trust proxy', 1))"]
        AuthMid["Security Middleware<br>(authenticate,<br>requireLibrarian,<br>requireUserLogged)"]
        Controllers["Controller Layer<br>(auth, book,<br>reservation, admin)"]
        Services["Service Layer<br>(business logic,<br>transactions,<br>token refresh)"]
        ORM["Prisma ORM Client<br>(Type-Safe<br>Database Access)"]
    end

    subgraph DataTier["Livello di Persistenza<br>(Database &amp; Identity)"]
        PG[("PostgreSQL<br>Database<br>(Supabase Cloud)")]
        AuthService[("Supabase Auth<br>(JWT &amp;<br>Bcrypt Engine)")]
    end

    UI --- State & Routing
    Routing --- APIClient
    Server --- ProxyConf & AuthMid
    AuthMid --- Controllers
    Controllers --- Services
    Services --- ORM
    ORM --- PG
    Services -.-> AuthService
    APIClient -- "HTTPS / JSON<br>Payload<br>HttpOnly Cookies" --> Server
    Server -- "HTTP<br>200/201/400/<br>401/403/404<br>+ Set-Cookie" --> APIClient
```