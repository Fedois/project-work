## Diagramma dei Casi d'Uso (Use Case Diagram)

Il seguente diagramma descrive gli attori del sistema (**Visitatore non autenticato**, **Iscritto / Member** e **Bibliotecario / Admin**) e le relative interazioni con la piattaforma Hubiblio.

```mermaid
flowchart
 subgraph AdminSys["Dashboard Bibliotecario<br>(Ruolo Librarian/Admin)"]
        UC_Stats["Monitoraggio KPI e Statistiche"]
        UC_ManageCatalog["CRUD Catalogo (Aggiunta, Modifica, Rimozione protetta)"]
        UC_ApproveReject["Approvazione / Rifiuto prenotazioni"]
        UC_FulfillLoan["Registrazione prestito da prenotazione (FULFILLED)"]
        UC_ReturnLoan["Registrazione restituzione & reintegro copia"]
  end
  subgraph MemberSys["Le mie prenotazioni<br>(Ruolo Member)"]
        UC_Reserve["Richiesta prenotazione (PENDING)"]
        UC_ViewMyBooks["Monitoraggio prenotazioni & scadenze"]
        UC_CancelRes["Annullamento prenotazione personale"]
  end
 subgraph AuthSys["Autenticazione & Profilo"]
        UC_Reg["Registrazione account / Login"]
        UC_Logout["Disconnessione"]
  end
 subgraph CatalogSys["Catalogo & Feedback"]
        UC_Browse["Consultazione catalogo & filtri"]
        UC_ViewDetail["Visualizzazione scheda libro & copie"]
        UC_Feedback["Pubblicazione recensione (1-5 stelle)"]
        UC_Loan["Prenotazione prestito"]
  end
    Guest["Visitatore (Non autenticato)"] --> UC_Browse & UC_ViewDetail & UC_Reg
    Member["Iscritto (Ruolo MEMBER)"] --> UC_Browse & UC_ViewDetail & UC_Logout & UC_Feedback & UC_Loan
    AdminSys ~~~ MemberSys ~~~ Guest & Member
```

