"use strict";

const express = require("express");
const dayjs = require("dayjs");
const { check, validationResult } = require("express-validator");
const cors = require("cors");
const passport = require("passport"); // auth middleware
const LocalStrategy = require("passport-local").Strategy; // username and password for login
const dao = require("./dao");
const userDao = require("./user-dao"); // module for accessing the users in the DB
const session = require("express-session"); // enable sessions

// init express
const app = new express();
const port = 3001;

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(
  new LocalStrategy(function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user) {
        return done(null, false, {
          message: "Credenziali non corrette",
        });
      }

      return done(null, user);
    });
  })
);

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao
    .getUserById(id)
    .then((user) => {
      done(null, user); // this will be available in req.user
    })
    .catch((err) => {
      done(err, null);
    });
});

app.use(express.json());

const corsOption = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOption));

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  //da mettere in tutte le API
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: "not authenticated" });
};

// set up the session
app.use(
  session({
    // by default, Passport uses a MemoryStore to keep track of the sessions
    secret:
      "a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

/*** Users APIs ***/

// POST /sessions
// login
app.post("/api/sessions", function (req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err) return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE /sessions/current
// logout
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.end();
  });
});

app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else res.status(401).json({ error: "Unauthenticated user!" });
});

app.get("/api/indovinello/nuovoId", isLoggedIn, async (req, res) => {
  try {
    let id = await dao.getNuovoId();

    if (id == undefined) {
      return res.status(404).json({
        error: `Errore 404: id non trovato`,
      });
    }

    res.status(200).json(id[0].id + 1);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

app.get(
  "/api/indovinello/timestamp/:idIndovinello",
  isLoggedIn,
  async (req, res) => {
    try {
      let timestamp = await dao.getTimestamp(req.params.idIndovinello);

      res.status(200).json(timestamp);
    } catch (err) {
      console.log(err);
      res.status(500).end();
    }
  }
);

app.get(
  "/api/risposte/:idIndovinello",
  isLoggedIn,
  [check("idIndovinello").isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      res.status(422).json({
        errors: errors.array(),
      });

    try {
      const indovinello = await dao.getIndovinelliById(
        req.params.idIndovinello
      );
      if (!indovinello.length) {
        return res.status(404).json({
          error: `Errore 404: nessuna indovinello con questo id: ${req.params.idIndovinello}`,
        });
      }

      const risposte = await dao.getRisposte(req.params.idIndovinello);

      if (risposte == undefined) {
        return res.status(404).json({
          error: `Errore 404: nessuna risposta trovata`,
        });
      }

      let risposteFiltrate = [];

      risposteFiltrate = risposte.filter(
        (r) => r.idIndovinello == req.params.idIndovinello
      );

      res.status(200).json(risposteFiltrate);
    } catch (err) {
      console.log(err);
      res.status(500).end();
    }
  }
);

app.get(
  "/api/indovinelli/filter/:filter",
  isLoggedIn,
  [check("filter").isString()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      res.status(422).json({
        errors: errors.array(),
      });

    try {
      let cl = false;
      let indovinelli = await dao.getIndovinelli();

      let classifica = [];
      let indovinelliFiltrati = [];
      switch (req.params.filter) {
        case "tutti gli indovinelli":
          indovinelliFiltrati = indovinelli;
          break;
        case "i miei indovinelli":
          indovinelliFiltrati = indovinelli.filter(
            (indovinelli) => indovinelli.user == req.user.id
          );
          break;
        case "classifica":
          cl = true;
          classifica = await dao.getTopTre();
          break;

        default:
          indovinelliFiltrati = indovinelli;
      }
      cl ? res.json(classifica) : res.json(indovinelliFiltrati);
    } catch (err) {
      console.log(err);
      res.status(500).end();
    }
  }
);

app.get(
  "/api/anonimo/indovinelli/filter/:filter",
  [check("filter").isString()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      res.status(422).json({
        errors: errors.array(),
      });

    try {
      let cl = false;
      let indovinelli = await dao.getIndovinellAnonimi();
      let classifica = [];
      let indovinelliFiltrati = [];
      switch (req.params.filter) {
        case "tutti gli indovinelli":
          indovinelliFiltrati = indovinelli;
          break;
        case "i miei indovinelli":
          indovinelliFiltrati = indovinelli.filter(
            (indovinelli) => indovinelli.user == req.user.id
          );
          break;
        case "classifica":
          cl = true;
          classifica = await dao.getTopTre();
          break;

        default:
          indovinelliFiltrati = indovinelli;
      }
      cl ? res.json(classifica) : res.json(indovinelliFiltrati);
    } catch (err) {
      console.log(err);
      res.status(500).end();
    }
  }
);

app.post(
  "/api/add",
  isLoggedIn,
  [check("domanda").isString().notEmpty()],
  [check("stato").isString().notEmpty()],
  [check("difficoltà").isString().notEmpty()],
  [check("durata").isInt()],
  [check("risposta").isString().notEmpty()],
  [check("suggerimentoUno").isString().notEmpty()],
  [check("suggerimentoDue").isString().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      res.status(422).json({
        errors: errors.array(),
      });

    const indovinello = {
      domanda: req.body.domanda,
      stato: req.body.stato,
      difficoltà: req.body.difficoltà,
      durata: req.body.durata,
      risposta: req.body.risposta,
      suggerimentoUno: req.body.suggerimentoUno,
      suggerimentoDue: req.body.suggerimentoDue,
      timestamp: req.body.timestamp,
      user: req.user.id,
    };

    try {
      await dao.aggiungiIndovinello(indovinello);
      res.status(201).end();
    } catch (err) {
      console.log(err);
      res.status(503).end();
    }
  }
);

app.post(
  "/api/risposta/:indovinelloId",
  isLoggedIn,
  [check("indovinelloId").isInt()],
  [check("risposta").isString().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      res.status(422).json({
        errors: errors.array(),
      });

    const indovinello = await dao.getIndovinelliById(req.params.indovinelloId);
    if (!indovinello.length) {
      return res.status(404).json({
        error: `Errore 404: nessuna indovinello con questo id: ${req.params.indovinelloId}`,
      });
    }

    const risposta = {
      idIndovinello: req.params.indovinelloId,
      idUser: req.user.id,
      risposta: req.body.risposta,
    };

    try {
      await dao.aggiungiRisposta(risposta);
      res.status(201).end();
    } catch (err) {
      console.log(err);
      res.status(503).end();
    }
  }
);

app.put(
  "/api/indovinello/:indovinelloId",
  isLoggedIn,
  [check("indovinelloId").isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      res.status(422).json({
        errors: errors.array(),
      });

    const indovinello = {
      indovinelloId: req.params.indovinelloId,
      timestamp: req.body.timestamp,
    };
    try {
      await dao.modificaIndovinello(indovinello);
      res.status(201).end();
    } catch (err) {
      console.log(err);
      res.status(500).end();
    }
  }
);

app.put(
  "/api/indovinello/stato/:indovinelloId",
  isLoggedIn,
  [check("indovinelloId").isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      res.status(422).json({
        errors: errors.array(),
      });

    const ind = await dao.getIndovinelliById(req.params.indovinelloId);
    if (!ind.length) {
      return res.status(404).json({
        error: `Errore 404: nessuna indovinello con questo id: ${req.params.indovinelloId}`,
      });
    }

    const indovinello = {
      indovinelloId: req.params.indovinelloId,
      stato: req.body.stato,
    };
    try {
      await dao.modificaIndovinelloStato(indovinello);
      res.status(201).end();
    } catch (err) {
      console.log(err);
      res.status(500).end();
    }
  }
);

app.get("/api/users", isLoggedIn, async (req, res) => {
  try {
    const users = await dao.getUsers();
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

app.put(
  "/api/user/punteggio/:punteggio",
  isLoggedIn,
  [check("punteggio").isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      res.status(422).json({
        errors: errors.array(),
      });

    const user = {
      userId: req.user.id,
      punteggio: req.params.punteggio,
    };
    try {
      await dao.modificaPunteggioUser(user);
      res.status(201).end();
    } catch (err) {
      console.log(err);
      res.status(500).end();
    }
  }
);
