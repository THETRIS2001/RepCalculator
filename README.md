# Calcolatore 1RM - Progressive Web App

Una Progressive Web App per calcolare il massimale (1RM) utilizzando 16 formule scientifiche diverse.

## Caratteristiche

- 📱 **PWA Installabile**: Può essere installata su iOS e Android come un'app nativa
- 📊 **16 Formule Scientifiche**: Include le formule più accurate per stimare il massimale
- 📈 **Grafici Interattivi**: Visualizza il confronto tra le diverse formule
- 💾 **Funziona Offline**: Grazie al Service Worker
- 🌙 **Supporta Dark Mode**: Si adatta alle preferenze del sistema
- ⚡ **Lightning Fast**: Ottimizzata per le performance

## Installazione su iOS

1. **Apri il sito** in Safari
2. **Tocca il pulsante "Condividi"** (icona con quadrato e freccia)
3. **Scorri verso il basso** e tocca "Aggiungi a Home"
4. **Conferma** toccando "Aggiungi"

L'app verrà aggiunta alla schermata home come un'app nativa!

## Installazione su Android

1. **Apri il sito** in Chrome
2. **Tocca il menu** (tre punti in alto a destra)
3. **Tocca "Installa app"**
4. **Conferma** l'installazione

## Deploy su GitHub Pages

1. **Fork** questo repository
2. Vai su **Settings** -> **Pages**
3. Seleziona **Deploy from a branch**
4. Scegli **main branch** e **/ (root)**
5. Tocca **Save**

Il tuo sito sarà disponibile all'indirizzo: `https://[tuo-username].github.io/[nome-repo]/`

## Struttura dei File

```
├── index.html          # Struttura HTML
├── style.css           # Stili e responsive design
├── script.js           # Logica JavaScript
├── manifest.json       # Configurazione PWA
├── sw.js               # Service Worker
├── icon-192.svg        # Icona 192x192
├── icon-512.svg        # Icona 512x512
└── README.md           # Questo file
```

## Tecnologie Utilizzate

- HTML5 + CSS3 + JavaScript (Vanilla)
- Chart.js per i grafici
- Service Worker per offline functionality
- Web App Manifest per installazione
- CSS Grid e Flexbox per layout responsive

## Browser Supportati

- ✅ Safari (iOS 11.3+)
- ✅ Chrome (Android/Desktop)
- ✅ Firefox
- ✅ Edge
- ✅ Opera

## Licenza

Questo progetto è open source e disponibile per uso personale e modifiche.