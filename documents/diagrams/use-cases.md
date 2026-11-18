## Diagramma dei Casi d'Uso (Use Case Diagram)

Il seguente diagramma descrive gli attori del sistema (**Visitatore non autenticato**, **Iscritto / Member** e **Bibliotecario / Admin**) e le relative interazioni con la piattaforma Hubiblio.

```mermaid
flowchart LR
    %% Attori
    Guest["Visitatore (Non autenticato)"]
    Member["Iscritto (Ruolo MEMBER)"]
    Librarian["Bibliotecario (LIBRARIAN / ADMIN)"]

    %% Sottosistema Autenticazione
    subgraph AuthSys ["Autenticazione & Profilo"]
        UC_Reg["Registrazione account"]
        UC_Login["Accesso / Login"]
        UC_Logout["Disconnessione"]
        UC_Profile["Visualizzazione profilo e ruolo"]
    end

    %% Sottosistema Catalogo & Lettura
    subgraph CatalogSys ["Catalogo & Feedback"]
        UC_Browse["Consultazione catalogo e ricerca/filtri"]
        UC_ViewDetail["Visualizzazione scheda libro e disponibilità"]
        UC_Feedback["Invio recensione e valutazione (1-5 stelle)"]
    end

    %% Sottosistema Area Personale Utente
    subgraph MemberSys ["Area Personale (I Miei Libri)"]
        UC_Reserve["Richiesta prenotazione libro (PENDING)"]
        UC_ViewMyBooks["Monitoraggio prenotazioni e prestiti personali"]
        UC_CancelRes["Annullamento prenotazione personale"]
    end

    %% Sottosistema Dashboard Amministrativa
    subgraph AdminSys ["Dashboard Bibliotecario"]
        UC_Stats["Visualizzazione metriche e statistiche di sistema"]
        UC_ManageCatalog["CRUD Catalogo (Aggiunta, Modifica, Rimozione sicura)"]
        UC_ApproveReject["Approvazione / Rifiuto prenotazioni"]
        UC_FulfillLoan["Evasione prenotazione registrando prestito (FULFILLED)"]
        UC_ReturnLoan["Registrazione restituzione con reintegro copia"]
    end

    %% Relazioni Visitatore
    Guest --> UC_Browse
    Guest --> UC_ViewDetail
    Guest --> UC_Reg
    Guest --> UC_Login

    %% Relazioni Member (eredita privilegi di lettura + area riservata)
    Member --> UC_Browse
    Member --> UC_ViewDetail
    Member --> UC_Logout
    Member --> UC_Profile
    Member --> UC_Feedback
    Member --> UC_Reserve
    Member --> UC_ViewMyBooks
    Member --> UC_CancelRes

    %% Relazioni Bibliotecario (accesso amministrativo dedicato)
    Librarian --> UC_Logout
    Librarian --> UC_Profile
    Librarian --> UC_Stats
    Librarian --> UC_ManageCatalog
    Librarian --> UC_ApproveReject
    Librarian --> UC_FulfillLoan
    Librarian --> UC_ReturnLoan
```

