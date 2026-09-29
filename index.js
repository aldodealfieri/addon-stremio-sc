const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const axios = require("axios");

let SC_DOMAIN = "https://streamingcommunity.vip";

const HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*"
};

const manifest = {
    id: "org.stremio.streamingcommunity.ita",
    version: "1.0.0",
    name: "StreamingCommunity ITA",
    description: "Cerca e riproduce contenuti da StreamingCommunity in italiano",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: [] // Aggiunta la lista catalogo vuota per conformità SDK Stremio
};

const builder = new addonBuilder(manifest);

async function getMediaDetails(imdbId) {
    try {
        const response = await axios.get(`https://v3-cinemeta.strem.io/meta/movie/${imdbId}.json`);
        if (response.data && response.data.meta) {
            return {
                title: response.data.meta.name,
                year: response.data.meta.year
            };
        }
    } catch (error) {
        console.error("Errore Cinemeta:", error.message);
    }
    return null;
}

async function searchStreamingCommunity(title) {
    try {
        const searchUrl = `${SC_DOMAIN}/api/search?q=${encodeURIComponent(title)}`;
        const response = await axios.get(searchUrl, { headers: HTTP_HEADERS });

        if (response.data && response.data.data && response.data.data.length > 0) {
            const firstResult = response.data.data[0];
            const mediaId = firstResult.id;
            const streamUrl = `${SC_DOMAIN}/watch/${mediaId}`;

            return {
                title: `StreamingCommunity - 1080p [ITA]`,
                url: streamUrl,
                behaviorHints: {
                    notSupported: false,
                    requestHeaders: {
                        "Referer": `${SC_DOMAIN}/`,
                        "User-Agent": HTTP_HEADERS["User-Agent"]
                    }
                }
            };
        }
    } catch (error) {
        console.error("Errore ricerca SC:", error.message);
    }
    return null;
}

builder.defineStreamHandler(async (args) => {
    const imdbId = args.id.split(":")[0];
    const mediaInfo = await getMediaDetails(imdbId);
    if (!mediaInfo) return { streams: [] };

    const scStream = await searchStreamingCommunity(mediaInfo.title);
    if (scStream) return { streams: [scStream] };

    return { streams: [] };
});

const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });
console.log(`Add-on avviato sulla porta ${PORT}`);
