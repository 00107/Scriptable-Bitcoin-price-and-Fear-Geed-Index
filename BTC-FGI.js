// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: magic;
// Bitcoin-Preis und Fear & Greed Index Widget mit schwarzem Hintergrund + Graph

const bitcoinApiUrl = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur";
const fearGreedApiUrl = "https://api.alternative.me/fng/?limit=10"; // Letzte 10 Tage abrufen

// Bitcoin-Preis abrufen
async function getBitcoinPrice() {
    let req = new Request(bitcoinApiUrl);
    let res = await req.loadJSON();
    return res.bitcoin.eur;
}

// Fear & Greed Index abrufen (letzte 10 Tage)
async function getFearGreedIndex() {
    let req = new Request(fearGreedApiUrl);
    let res = await req.loadJSON();
    
    let history = res.data.map(entry => parseInt(entry.value)); // Werte als Zahlen speichern
    let current = history[0]; // Aktueller Wert
    let classification = res.data[0].value_classification; // Beschreibung
    
    return { current, classification, history };
}

// Funktion zur Bestimmung der Textfarbe
function getTextColor(value) {
    if (value <= 24) return new Color("#FF3B30"); // Extreme Fear (Rot)
    if (value <= 49) return new Color("#FF9500"); // Fear (Orange)
    if (value <= 54) return new Color("#FFD60A"); // Neutral (Gelb)
    if (value <= 74) return new Color("#34C759"); // Greed (Grün)
    return new Color("#00A653"); // Extreme Greed (Dunkelgrün)
}

// ASCII-Graph aus Werten generieren
function createGraph(values) {
    let max = Math.max(...values);
    let min = Math.min(...values);
    
    let bars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"]; // Verschiedene Balkenhöhen
    let graph = values.map(v => {
        let index = Math.floor((v - min) / (max - min) * (bars.length - 1));
        return bars[index];
    }).join(""); // Balken zusammenfügen
    
    return graph; // Graph als Text zurückgeben
}

// Widget erstellen
async function createWidget() {
    let widget = new ListWidget();
    widget.setPadding(10, 10, 10, 10);
    widget.backgroundColor = new Color("#000000"); // Hintergrund schwarz

    // Bitcoin Preis abrufen
    let btcPrice = await getBitcoinPrice();
    
    // Fear & Greed Index abrufen
    let fearGreed = await getFearGreedIndex();
    let fngColor = getTextColor(fearGreed.current);
    
    // Überschrift
    let header = widget.addText("₿TC");
    header.font = Font.boldSystemFont(24) ,'bold';
    header.textColor = new Color("#EAB308");

    widget.addSpacer(5);

    // Bitcoin Preis anzeigen
    let btcText = widget.addText(`${btcPrice} €`);
    btcText.font = Font.systemFont(20);
    btcText.textColor = new Color("#0EA5E9") ,'bold';

    widget.addSpacer(5);

    // Fear & Greed Index mit Farbe anzeigen
    let fngText = widget.addText(`Fear & Greed: ${fearGreed.current} (${fearGreed.classification})`);
    fngText.font = Font.systemFont(20);
    fngText.textColor = fngColor;

    widget.addSpacer(5);

    // 🔥 ASCII-Graph einfügen
    let graphText = widget.addText(`📉 ${createGraph(fearGreed.history)}`);
    graphText.font = Font.systemFont(20);
    graphText.textColor = new Color("#FFFFFF");

    return widget;
}

// Widget ausführen
let widget = await createWidget();
Script.setWidget(widget);
widget.presentSmall();
Script.complete();