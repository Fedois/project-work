## Limiti del prototipo e sviluppi futuri

Il prototipo realizzato consente di implementare le principali funzionalità necessarie alla gestione di una biblioteca digitale, quali la consultazione del catalogo, la gestione dei prestiti e delle prenotazioni, la raccolta dei feedback e la presenza di un pannello dedicato alla gestione dei contenuti. Tuttavia, l'applicazione presenta alcuni limiti, sia dal punto di vista funzionale sia sotto il profilo dell'ottimizzazione, della sicurezza e della scalabilità.

Le funzionalità implementate sono state progettate principalmente con l'obiettivo di dimostrare il funzionamento dell'architettura e dei principali flussi applicativi. Di conseguenza, alcuni aspetti che sarebbero rilevanti in un'applicazione destinata a un utilizzo reale possono essere ulteriormente sviluppati.

### Sviluppi futuri

Tra i possibili sviluppi futuri rientra innanzitutto il miglioramento della gestione dei contenuti e dell'esperienza utente. In particolare, sarebbe possibile introdurre un sistema di **paginazione** per i libri e per i feedback, così da migliorare le prestazioni dell'interfaccia in presenza di una quantità elevata di dati. A questo potrebbe essere affiancato un sistema di **filtri e ricerca più avanzato**, per la dashboard dedicata alla gestione dei libri. Per i feedback potrebbe inoltre essere introdotto un filtro basato sulla valutazione in stelle.

Un'altra possibile evoluzione riguarda la possibilità per gli utenti di **salvare i libri tra i preferiti**. Questa funzionalità permetterebbe di creare una sorta di lista personale dalla quale poter ritrovare facilmente i libri di interesse e procedere successivamente alla relativa prenotazione.

Dal punto di vista della comunicazione, potrebbe essere implementato un sistema di **invio di email transazionali**, ad esempio attraverso un servizio come Resend, per notificare agli utenti eventi quali la conferma di una prenotazione, la disponibilità di un libro o l'avvicinarsi della scadenza di un prestito.

Per rendere l'applicazione maggiormente accessibile a un pubblico internazionale, sarebbe inoltre possibile introdurre il **supporto multilingua**, inizialmente per italiano e inglese. Le traduzioni potrebbero essere organizzate tramite file YAML, separando i contenuti testuali dalla logica dell'applicazione e rendendo più semplice l'aggiunta di ulteriori lingue in futuro.

Un ulteriore sviluppo riguarderebbe la gestione delle immagini. Attualmente il campo `coverImagePath` permette di associare una copertina a un libro, ma l'architettura potrebbe essere estesa integrando **Supabase Storage** per la gestione e la conservazione delle immagini. Lo stesso approccio potrebbe essere utilizzato per introdurre le **foto profilo degli utenti**, tramite avatar associati al relativo account.

### Progressive Web App, SEO e analytics

Dal punto di vista tecnico, l'applicazione potrebbe essere trasformata in una **Progressive Web App (PWA)**, consentendo agli utenti di installarla sui propri dispositivi e migliorando l'esperienza di utilizzo anche in mobilità.

Sarebbe inoltre possibile intervenire sull'ottimizzazione per i motori di ricerca (**SEO**), migliorando la struttura delle pagine, i metadati e gli elementi utilizzati dai motori di ricerca per l'indicizzazione dei contenuti.

Un'ulteriore evoluzione potrebbe riguardare l'integrazione di strumenti di **analytics** come Google Analitycs, utili per raccogliere informazioni aggregate sull'utilizzo dell'applicazione. Questi strumenti permetterebbero, ad esempio, di analizzare quali sezioni vengono utilizzate maggiormente, quali libri ricevono più visualizzazioni e quali funzionalità risultano più rilevanti per gli utenti. L'eventuale introduzione di sistemi di analytics dovrebbe naturalmente essere accompagnata da un'adeguata gestione del consenso e della privacy.

### Privacy e sicurezza

Un'applicazione destinata a un utilizzo reale richiederebbe anche un'attenzione maggiore agli aspetti legati alla **privacy e alla protezione dei dati personali**. Tra gli sviluppi possibili rientra l'integrazione di una soluzione per la gestione dei cookie e dei consensi, eventualmente attraverso servizi specializzati come iubenda.

Anche la gestione delle immagini potrebbe essere ulteriormente migliorata dal punto di vista della sicurezza. L'utilizzo di **Supabase Storage** permetterebbe di gestire in maniera più strutturata il caricamento e l'accesso ai file tramite RRow Level Security che Supabase integra, superando l'attuale gestione basata esclusivamente su URL HTTPS.

Un ulteriore miglioramento potrebbe riguardare la realizzazione di una suite di **test unitari e di integrazione** come Vitest e Supertest, in modo da verificare automaticamente il corretto funzionamento delle principali componenti dell'applicazione e ridurre il rischio di regressioni durante le modifiche future.

Dal punto di vista dell'interfaccia, sarebbe inoltre opportuno sostituire gli attuali messaggi di conferma basati sul metodo JavaScript `confirm()` con **modali personalizzati**, maggiormente coerenti con il design dell'applicazione e più intuitivi per l'utente.

### Funzionalità avanzate e intelligenza artificiale

Tra gli sviluppi più avanzati potrebbe essere introdotto un sistema di **raccomandazione basato sull'intelligenza artificiale**, in grado di suggerire libri agli utenti sulla base delle loro ricerche, delle preferenze espresse, dei libri consultati o dei feedback precedentemente lasciati.

In una prima versione, il sistema potrebbe utilizzare semplici criteri di raccomandazione basati sulle categorie e sui comportamenti dell'utente; successivamente potrebbe essere esteso attraverso modelli di machine learning o servizi di intelligenza artificiale in grado di elaborare le preferenze e produrre suggerimenti personalizzati.

### Servizi cloud e possibili integrazioni future

L'architettura potrebbe essere ulteriormente evoluta attraverso l'integrazione di servizi cloud dedicati come AWS. Oltre all'utilizzo di Supabase per il database e, in prospettiva, per lo storage delle immagini, potrebbero essere introdotti servizi esterni per l'invio delle email, il monitoraggio dell'applicazione, l'analisi dei dati e la gestione dei file.

In un'ipotetica evoluzione verso una piattaforma commerciale, potrebbe inoltre essere valutata l'integrazione di **sistemi di pagamento online** come Stripe, ad esempio per la gestione di eventuali servizi premium, iscrizioni o funzionalità aggiuntive. Questa possibilità non rientra negli obiettivi dell'attuale prototipo, ma rappresenta un'estensione coerente con una futura trasformazione dell'applicazione in un servizio rivolto a un numero maggiore di utenti.

Nel complesso, gli sviluppi descritti permetterebbero di trasformare il prototipo attuale in un'applicazione più completa, scalabile e adatta a un contesto di produzione, intervenendo progressivamente sull'esperienza utente, sulla qualità del software, sulla sicurezza, sull'analisi dei dati e sulla personalizzazione dei servizi.