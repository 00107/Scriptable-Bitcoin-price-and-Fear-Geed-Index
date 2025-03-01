// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: magic;

const bitcoinApiUrl = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur";
const fearGreedApiUrl = "https://api.alternative.me/fng/?limit=10"; 

// Bitcoin-Preis
async function getBitcoinPrice() {
    let req = new Request(bitcoinApiUrl);
    let res = await req.loadJSON();
    return res.bitcoin.eur;
}

// Fear & Greed Index (letzte 10 Tage)
async function getFearGreedIndex() {
    let req = new Request(fearGreedApiUrl);
    let res = await req.loadJSON();
    
    let history = res.data.map(entry => parseInt(entry.value)); 
    let current = history[0]; 
    let classification = res.data[0].value_classification; 
    
    return { current, classification, history };
}

// Bestimmung der Textfarbe
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
    
    let bars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"]; 
    let graph = values.map(v => {
        let index = Math.floor((v - min) / (max - min) * (bars.length - 1));
        return bars[index];
    }).join(""); 
    
    return graph.split("").reverse().join(""); // Reihenfolge umkehren
}

async function createWidget() {
    let widget = new ListWidget();
    widget.setPadding(10, 10, 10, 10);
    widget.backgroundColor = new Color("#000000"); // Hintergrund schwarz

    // Bitcoin Preis 
    let btcPrice = await getBitcoinPrice();
    
    // Fear & Greed Index 
    let fearGreed = await getFearGreedIndex();
    let fngColor = getTextColor(fearGreed.current);
    
    let headerStack = widget.addStack();
    headerStack.layoutHorizontally(); // Nebeneinander
    headerStack.centerAlignContent(); // Vertikal ausrichten

    // Bitcoin Symbol
    let header = headerStack.addText("₿TC ");
    header.font = Font.boldSystemFont(26);
    header.textColor = new Color("#EAB308");

    // headerStack.addSpacer();
    headerStack.addSpacer(6);

    // Bitcoin Preis
    let btcText = headerStack.addText(`${btcPrice} €    `);
    btcText.font = Font.boldSystemFont(26);
    btcText.textColor = new Color("#0EA5E9");

    widget.addSpacer(5);

    // Fear & Greed Index
    let fngText = widget.addText(`Fear & Greed: ${fearGreed.current} (${fearGreed.classification})`);
    fngText.font = Font.systemFont(20);
    fngText.textColor = fngColor;

    widget.addSpacer(5);

    let graphText = widget.addText(` ${createGraph(fearGreed.history)}`);
    graphText.font = Font.boldSystemFont(20);
    graphText.textColor = new Color("#FFFFFF");

    return widget;
}

let widget = await createWidget();
Script.setWidget(widget);
widget.presentSmall();
Script.complete();
