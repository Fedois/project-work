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