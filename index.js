const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const axios = require("axios");

const SC_DOMAIN = "https://streamingcommunityz.pictures";

const HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Referer": `${SC_DOMAIN}/`
};

const manifest = {
    id: "org.stremio.streamingcommunity.ita",
    version: "1.0.0",
    name: "StreamingCommunity ITA",
    description: "Guarda film e serie TV da StreamingCommunity",
    resources: [
        {
            name: "stream",
            types: ["movie", "series"],
            idPrefixes: ["tt"]
        }
    ],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: []
};

const builder = new addonBuilder(manifest);

async function getMediaDetails(imdbId, type) {
    try {
        const url = `https://v3-cinemeta.strem.io/meta/${type}/${imdbId}.json`;
        console.log(`[Cinemeta] Recupero informazioni per ID ${imdbId} (${type})...`);
        const response = await axios.get(url, { timeout: 5000 });
        if (response.data && response.data.meta) {
            return {
                title: response.data.meta.name,
                year: response.data.meta.year
            };
        }
    } catch (error) {
        console.error("[Cinemeta Error]:", error.message);
    }
    return null;
}

async function searchStreamingCommunity(title) {
    try {
        console.log(`[SC Search] Ricerca su StreamingCommunity per: "${title}"...`);
        const searchUrl = `${SC_DOMAIN}/api/search?q=${encodeURIComponent(title)}`;
        const response = await axios.get(searchUrl, { headers: HTTP_HEADERS, timeout: 5000 });

        if (response.data && response.data.data && response.data.data.length > 0) {
            const match = response.data.data[0];
            const watchUrl = `${SC_DOMAIN}/watch/${match.id}`;
            console.log(`[SC Found] Trovato match ID ${match.id}: ${match.name || title}`);

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
            console.log(`[SC Search] Nessun risultato trovato per: "${title}"`);
        }
    } catch (error) {
        console.error("[SC Search Error]:", error.message);
    }
    return null;
}

builder.defineStreamHandler(async (args) => {
    console.log(`\n==================================================`);
    console.log(`[STREAM REQUEST] Ricevuta richiesta da Stremio!`);
    console.log(`Tipo: ${args.type} | ID: ${args.id}`);
    console.log(`==================================================`);

    const cleanImdbId = args.id.split(":")[0];
    const mediaInfo = await getMediaDetails(cleanImdbId, args.type);

    if (!mediaInfo) {
        console.log("[Stream Handler] Impossibile recuperare i dettagli da Cinemeta.");
        return { streams: [] };
    }

    const scStream = await searchStreamingCommunity(mediaInfo.title);
    if (scStream) {
        return { streams: [scStream] };
    }

    return { streams: [] };
});

const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });
console.log(`Add-on avviato sulla porta ${PORT}`);
