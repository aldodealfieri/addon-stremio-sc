const express = require("express");
const cors = require("cors");
const { addonBuilder } = require("stremio-addon-sdk");
const axios = require("axios");

const app = express();
app.use(cors()); // Abilita CORS per permettere a Stremio (Web, App, TV) di comunicare senza blocchi

const SC_DOMAIN = "https://streamingcommunityz.pictures";

const HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Referer": `${SC_DOMAIN}/`
};

const manifest = {
    id: "org.stremio.sc.render.cloud",
    version: "1.0.0",
    name: "StreamingCommunity Cloud",
    description: "Guarda film e serie TV da StreamingCommunity in cloud",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: []
};

const builder = new addonBuilder(manifest);

async function getMediaDetails(imdbId, type) {
    try {
        const url = `https://v3-cinemeta.strem.io/meta/${type}/${imdbId}.json`;
        console.log(`[Cinemeta] Info per ${imdbId} (${type})...`);
        const response = await axios.get(url, { timeout: 5000 });
        if (response.data && response.data.meta) {
            return {
                title: response.data.meta.name,
                year: response.data.meta.year
            };
        }
    } catch (error) {
        console.log("[Cinemeta Error]:", error.message);
    }
    return null;
}

async function searchStreamingCommunity(title) {
    try {
        console.log(`[Ricerca SC] Avvio ricerca per "${title}"...`);
        const searchUrl = `${SC_DOMAIN}/api/search?q=${encodeURIComponent(title)}`;
        const response = await axios.get(searchUrl, { headers: HTTP_HEADERS, timeout: 5000 });

        if (response.data && response.data.data && response.data.data.length > 0) {
            const match = response.data.data[0];
            const watchUrl = `${SC_DOMAIN}/watch/${match.id}`;
            console.log(`[Risultato SC] Trovato match: ${match.name || title} (ID: ${match.id})`);

            return {
                name: "StreamingCommunity",
                title: `${match.name || title}\n1080p [ITA]`,
                url: watchUrl,
                behaviorHints: {
                    notSupported: false,
                    requestHeaders: {
                        "User-Agent": HTTP_HEADERS["User-Agent"],
                        "Referer": `${SC_DOMAIN}/`
                    }
                }
            };
        } else {
            console.log(`[Ricerca SC] Nessun risultato per "${title}"`);
        }
    } catch (error) {
        console.log("[Ricerca SC Error]:", error.message);
    }
    return null;
}

builder.defineStreamHandler(async (args) => {
    console.log(`\n==============================================`);
    console.log(`[STREAM REQUEST] Chiamata ricevuta da Stremio!`);
    console.log(`Tipo: ${args.type} | ID: ${args.id}`);
    console.log(`==============================================`);

    const cleanImdbId = args.id.split(":")[0];
    const mediaInfo = await getMediaDetails(cleanImdbId, args.type);

    if (!mediaInfo) return { streams: [] };

    const scStream = await searchStreamingCommunity(mediaInfo.title);
    if (scStream) return { streams: [scStream] };

    return { streams: [] };
});

// Integrazione dell'interfaccia dell'SDK con Express
const addonInterface = builder.getInterface();

app.get("/manifest.json", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.json(addonInterface.manifest);
});

app.get("/stream/:type/:id.json", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    const { type, id } = req.params;
    const cleanId = id.replace(".json", "");
    const response = await addonInterface.get("stream", type, cleanId);
    res.json(response);
});

app.get("/", (req, res) => {
    res.send("Add-on Stremio StreamingCommunity per Render è attivo!");
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
    console.log(`Server Express avviato sulla porta ${PORT}`);
});
