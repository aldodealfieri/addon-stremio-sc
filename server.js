const express = require("express");

const app = express();

const PORT = process.env.PORT || 7000;

/*
 * MANIFEST
 */

const manifest = {
  id: "com.mio.stremioaddon",
  version: "1.0.0",
  name: "Mio Addon",
  description: "Addon Stremio personale",
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
 * MANIFEST ENDPOINT
 */

app.get("/manifest.json", (req, res) => {
  res.json(manifest);
});


/*
 * CATALOGO
 */

app.get("/catalog/movie/miei-film.json", (req, res) => {

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

});


/*
 * INFORMAZIONI DEL FILM
 */

app.get("/meta/movie/:id.json", (req, res) => {

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

});


/*
 * STREAM
 *
 * Per ora non restituisce stream.
 * Qui collegheremo successivamente
 * una sorgente/API autorizzata.
 */

app.get("/stream/movie/:id.json", async (req, res) => {

  res.json({
    streams: []
  });

});


/*
 * AVVIO SERVER
 */

app.listen(PORT, () => {

  console.log(
    `Addon Stremio avviato sulla porta ${PORT}`
  );

});
