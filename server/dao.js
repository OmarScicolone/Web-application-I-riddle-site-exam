"use strict";

const sqlite = require("sqlite3");
const db = new sqlite.Database("indovinelli.db", (err) => {
  if (err) throw err;
});

exports.getIndovinelli = () => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT id, stato, domanda, difficoltà, durata, risposta, suggerimentoUno, suggerimentoDue, timestamp, user FROM indovinelli";
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const indovinelli = rows.map((f) => ({
        id: f.id,
        stato: f.stato,
        domanda: f.domanda,
        difficoltà: f.difficoltà,
        durata: f.durata,
        risposta: f.risposta,
        suggerimentoUno: f.suggerimentoUno,
        suggerimentoDue: f.suggerimentoDue,
        timestamp: f.timestamp,
        user: f.user,
      }));
      resolve(indovinelli);
    });
  });
};

exports.getIndovinelliById = (indovinelloId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT id, stato, domanda, difficoltà, durata, risposta, suggerimentoUno, suggerimentoDue, timestamp, user FROM indovinelli WHERE id=?";
    db.all(sql, [indovinelloId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const indovinello = rows.map((f) => ({
        id: f.id,
        stato: f.stato,
        domanda: f.domanda,
        difficoltà: f.difficoltà,
        durata: f.durata,
        risposta: f.risposta,
        suggerimentoUno: f.suggerimentoUno,
        suggerimentoDue: f.suggerimentoDue,
        timestamp: f.timestamp,
        user: f.user,
      }));
      resolve(indovinello);
    });
  });
};

exports.getIndovinellAnonimi = () => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT id, stato, domanda, difficoltà, durata, timestamp, user FROM indovinelli";
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const indovinelli = rows.map((f) => ({
        id: f.id,
        stato: f.stato,
        domanda: f.domanda,
        difficoltà: f.difficoltà,
        durata: f.durata,
        timestamp: f.timestamp,
        user: f.user,
      }));
      resolve(indovinelli);
    });
  });
};

exports.getTopTre = () => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT id, nome, punteggio, DENSE_RANK () OVER (ORDER BY punteggio DESC) posizione FROM users";
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const topTre = rows
        .map((u) => ({
          id: u.id,
          nome: u.nome,
          punteggio: u.punteggio,
          posizione: u.posizione,
        }))
        .filter((u) => u.posizione <= 3);
      resolve(topTre);
    });
  });
};

exports.aggiungiIndovinello = (indovinello) => {
  return new Promise(async (resolve, reject) => {
    const sql =
      "INSERT INTO indovinelli (domanda, stato, difficoltà, durata, risposta, suggerimentoUno, suggerimentoDue, timestamp, user) VALUES(?,?,?,?,?,?,?,?,?)";
    db.run(
      sql,
      [
        indovinello.domanda,
        indovinello.stato,
        indovinello.difficoltà,
        indovinello.durata,
        indovinello.risposta,
        indovinello.suggerimentoUno,
        indovinello.suggerimentoDue,
        indovinello.timestamp,
        indovinello.user,
      ],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(null);
      }
    );
  });
};

exports.aggiungiRisposta = (risposta) => {
  return new Promise(async (resolve, reject) => {
    const sql =
      "INSERT INTO risposte (idIndovinello, idUser, risposta) VALUES(?,?,?)";
    db.run(
      sql,
      [risposta.idIndovinello, risposta.idUser, risposta.risposta],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(null);
      }
    );
  });
};

exports.getRisposte = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT id, idIndovinello, idUser, risposta FROM risposte";
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const risposte = rows.map((ind) => ({
        id: ind.id,
        idIndovinello: ind.idIndovinello,
        idUser: ind.idUser,
        risposta: ind.risposta,
      }));

      resolve(risposte);
    });
  });
};

exports.getNuovoId = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT seq FROM sqlite_sequence WHERE name=?";
    db.all(sql, ["indovinelli"], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const indovinello = rows.map((ind) => ({
        id: ind.seq,
      }));

      resolve(indovinello);
    });
  });
};

exports.modificaIndovinello = (indovinello) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE indovinelli SET timestamp = ? WHERE id=?";
    db.all(sql, [indovinello.timestamp, indovinello.indovinelloId], (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(null);
    });
  });
};

exports.modificaIndovinelloStato = (indovinello) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE indovinelli SET stato = ? WHERE id=?";
    db.all(sql, [indovinello.stato, indovinello.indovinelloId], (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(null);
    });
  });
};

exports.modificaPunteggioUser = (user) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE users SET punteggio = ? WHERE id=?";
    db.all(sql, [user.punteggio, user.userId], (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(null);
    });
  });
};

exports.getUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT id, email, nome, password, salt, punteggio FROM users";
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const users = rows.map((u) => ({
        id: u.id,
        email: u.email,
        nome: u.nome,
        password: u.password,
        salt: u.salt,
        punteggio: u.punteggio,
      }));
      resolve(users);
    });
  });
};

exports.getTimestamp = (idIndovinello) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT timestamp FROM indovinelli WHERE id=?";
    db.all(sql, [idIndovinello], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const timestamp = rows.map((ind) => ({
        id: ind.id,
        timestamp: ind.timestamp,
      }));

      resolve(timestamp);
    });
  });
};
