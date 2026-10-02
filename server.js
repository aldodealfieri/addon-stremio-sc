const express = require("express");

const app = express();
const PORT = process.env.PORT || 7000;

/*
 * ==========================================================
 * CONFIGURAZIONE
 * ==========================================================
 *
 * Se hai una sorgente/API autorizzata, inserisci qui il suo
 * indirizzo oppure, meglio, impostalo su Render come variabile
 * SOURCE_URL.
 */

const SOURCE_URL =
  process.env.SOURCE_URL || "https://streamingcommunityz.pictures/";


/*
 * ==========================================================
 * MANIFEST
 * ==========================================================
 */

const manifest = {
  id: "com.mio.stremio.addon",
  version: "1.0.0",

  name: "Mio Addon",

  description:
    "Addon Stremio personale",

  resources: [
    "catalog",
    "meta",
    "stream"
  ],

  types: [
    "movie",
    "series"
  ],

  catalogs: [
    {
      type: "movie",
      id: "miei-film",
      name: "I miei film"
    }
  ]
};


/*
 * ==========================================================
 * MANIFEST
 * ==========================================================
 */

app.get("/manifest.json", (req, res) => {
  res.json(manifest);
});


/*
 * ==========================================================
 * CATALOGO
 * ==========================================================
 */

app.get(
  "/catalog/movie/miei-film.json",
  (req, res) => {

    res.json({
      metas: [
        {
          id: "tt0133093",
          type: "movie",
          name: "The Matrix",
          poster:
            "https://images.metahub.space/poster/small/tt0133093/img"
        },

        {
          id: "tt0111161",
          type: "movie",
          name: "The Shawshank Redemption",
          poster:
            "https://images.metahub.space/poster/small/tt0111161/img"
        }
      ]
    });

  }
);


/*
 * ==========================================================
 * METADATA
 * ==========================================================
 */

app.get(
  "/meta/movie/:id.json",
  (req, res) => {

    const movies = {

      "tt0133093": {
        id: "tt0133093",
        type: "movie",
        name: "The Matrix"
      },

      "tt0111161": {
        id: "tt0111161",
        type: "movie",
        name: "The Shawshank Redemption"
      }

    };

    const movie = movies[req.params.id];

    if (!movie) {

      return res.status(404).json({
        error: "Film non trovato"
      });

    }

    res.json({
      meta: movie
    });

  }
);


/*
 * ==========================================================
 * STREAM
 * ==========================================================
 *
 * Questa parte è volutamente senza estrazione automatica
 * da siti di streaming non autorizzati.
 *
 * Qui puoi collegare una API/sorgente che sei autorizzato
 * a utilizzare.
 */

app.get(
  "/stream/movie/:id.json",
  async (req, res) => {

    const movieId = req.params.id;

    console.log(
      "Richiesta stream:",
      movieId
    );

    console.log(
      "Sorgente configurata:",
      SOURCE_URL
    );

    res.json({
      streams: []
    });

  }
);


/*
 * ==========================================================
 * SERVER
 * ==========================================================
 */

app.listen(PORT, () => {

  console.log(
    `Addon avviato sulla porta ${PORT}`
  );

});
