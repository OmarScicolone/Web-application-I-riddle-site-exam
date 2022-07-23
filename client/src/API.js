import dayjs from "dayjs";

const fixedURL = new URL("http://localhost:3001/api/");

async function logIn(credentials) {
  let response = await fetch(new URL("sessions", fixedURL), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logOut() {
  await fetch(new URL("sessions/current", fixedURL), {
    method: "DELETE",
    credentials: "include",
  });
}

async function getUserInfo() {
  const response = await fetch(new URL("sessions/current", fixedURL), {
    credentials: "include",
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo; // an object with the error coming from the server
  }
}

async function getAllIndovinelli() {
  const response = await fetch(new URL("indovinelli", fixedURL), {
    credentials: "include",
  });
  const indovinelliJson = await response.json();
  if (response.ok) {
    return indovinelliJson.map((ind) => ({
      id: ind.id,
      stato: ind.stato,
      domanda: ind.domanda,
      difficoltà: ind.difficoltà,
      durata: ind.durata,
      risposta: ind.risposta,
      suggerimentoUno: ind.suggerimentoUno,
      suggerimentoDue: ind.suggerimentoDue,
      timestamp: ind.timestamp,
      user: ind.user,
    }));
  } else {
    throw indovinelliJson; // an object with the error coming from the server
  }
}

async function getTuttiUsers() {
  const response = await fetch(new URL("users", fixedURL), {
    credentials: "include",
  });
  const usersJson = await response.json();
  if (response.ok) {
    return usersJson.map((user) => ({
      id: user.id,
      email: user.email,
      nome: user.nome,
      password: user.password,
      salt: user.salt,
      punteggio: user.punteggio,
    }));
  } else {
    throw usersJson; // an object with the error coming from the server
  }
}

async function getIndovinelliFiltrati(filter) {
  filter = filter.toLowerCase();
  const response = await fetch(fixedURL + `indovinelli/filter/${filter}`, {
    credentials: "include",
  });

  if (filter === "classifica") {
    const classificaJson = await response.json();

    if (response.ok) {
      return classificaJson.map((u) => ({
        id: u.id,
        nome: u.nome,
        punteggio: u.punteggio,
        posizione: u.posizione,
      }));
    } else {
      throw classificaJson;
    }
  } else {
    const indovinelliJson = await response.json();
    if (response.ok) {
      return indovinelliJson.map((ind) => ({
        id: ind.id,
        stato: ind.stato,
        domanda: ind.domanda,
        difficoltà: ind.difficoltà,
        durata: ind.durata,
        risposta: ind.risposta,
        suggerimentoUno: ind.suggerimentoUno,
        suggerimentoDue: ind.suggerimentoDue,
        timestamp: ind.timestamp,
        user: ind.user,
      }));
    } else {
      throw indovinelliJson;
    }
  }
}

async function getIndovinelliFiltratiAnonimi(filter) {
  filter = filter.toLowerCase();
  const response = await fetch(
    fixedURL + `anonimo/indovinelli/filter/${filter}`,
    {
      credentials: "include",
    }
  );

  if (filter === "classifica") {
    const classificaJson = await response.json(); // await perchè .json() torna una promise, dobbiamo aspettare che sia processata

    if (response.ok) {
      return classificaJson.map((u) => ({
        id: u.id,
        nome: u.nome,
        punteggio: u.punteggio,
        posizione: u.posizione,
      }));
    } else {
      throw classificaJson;
    }
  } else {
    const indovinelliJson = await response.json();
    if (response.ok) {
      return indovinelliJson.map((ind) => ({
        id: ind.id,
        stato: ind.stato,
        domanda: ind.domanda,
        difficoltà: ind.difficoltà,
        durata: ind.durata,
        timestamp: ind.timestamp,
        user: ind.user,
      }));
    } else {
      throw indovinelliJson;
    }
  }
}

async function getTimestamp(idindovinello) {
  const response = await fetch(
    new URL(`indovinello/timestamp/${idindovinello}`, fixedURL),
    {
      credentials: "include",
    }
  );
  const indovinelloJson = await response.json();

  if (response.ok) {
    return indovinelloJson.map((ind) => ({
      id: ind.id,
      timestamp: ind.timestamp,
    }));
  } else {
    throw indovinelloJson; // an object with the error coming from the server
  }
}

function aggiungiIndovinello(indovinello) {
  return new Promise((resolve, reject) => {
    fetch(new URL("add", fixedURL), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domanda: indovinello.domanda,
        stato: indovinello.stato,
        difficoltà: indovinello.difficoltà,
        durata: indovinello.durata,
        risposta: indovinello.risposta,
        suggerimentoUno: indovinello.suggerimentoUno,
        suggerimentoDue: indovinello.suggerimentoDue,
        timestamp: indovinello.timestamp,
        user: indovinello.user,
      }),
    })
      .then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response
            .json()
            .then((message) => {
              reject(message);
            }) // error message in the response body
            .catch(() => {
              reject({ error: "Cannot parse server response." });
            }); // something else
        }
      })
      .catch(() => {
        reject({ error: "Cannot communicate with the server." });
      }); // connection errors
  });
}

function aggiungiRisposta(nuovaRisposta) {
  return new Promise((resolve, reject) => {
    fetch(new URL("risposta/" + nuovaRisposta.idIndovinello, fixedURL), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idIndovinello: nuovaRisposta.idIndovinello,
        risposta: nuovaRisposta.risposta,
      }),
    })
      .then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response
            .json()
            .then((message) => {
              reject(message);
            }) // error message in the response body
            .catch(() => {
              reject({ error: "Cannot parse server response." });
            }); // something else
        }
      })
      .catch(() => {
        reject({ error: "Cannot communicate with the server." });
      }); // connection errors
  });
}

function modificaIndovinello(indovinelloId) {
  return new Promise((resolve, reject) => {
    fetch(new URL("indovinello/" + indovinelloId, fixedURL), {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timestamp: dayjs(),
      }),
    })
      .then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response
            .json()
            .then((obj) => {
              reject(obj);
            }) // error message in the response body
            .catch(() => {
              reject({ error: "Cannot parse server response." });
            }); // something else
        }
      })
      .catch(() => {
        reject({ error: "Cannot communicate with the server." });
      }); // connection errors
  });
}

function modificaIndovinelloStato(indovinelloId) {
  return new Promise((resolve, reject) => {
    fetch(new URL("indovinello/stato/" + indovinelloId, fixedURL), {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stato: "chiuso",
      }),
    })
      .then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response
            .json()
            .then((obj) => {
              reject(obj);
            }) // error message in the response body
            .catch(() => {
              reject({ error: "Cannot parse server response." });
            }); // something else
        }
      })
      .catch(() => {
        reject({ error: "Cannot communicate with the server." });
      }); // connection errors
  });
}

async function getRisposte(idindovinello) {
  const response = await fetch(new URL(`risposte/${idindovinello}`, fixedURL), {
    credentials: "include",
  });
  const risposteJson = await response.json();
  if (response.ok) {
    return risposteJson.map((ris) => ({
      id: ris.id,
      idIndovinello: ris.idIndovinello,
      idUser: ris.idUser,
      risposta: ris.risposta,
    }));
  } else {
    throw risposteJson; // an object with the error coming from the server
  }
}

async function nuovoIdIndovinello() {
  const response = await fetch(new URL(`indovinello/nuovoId`, fixedURL), {
    credentials: "include",
  });
  const idJson = await response.json();
  if (response.ok) {
    return idJson;
  } else {
    throw idJson; // an object with the error coming from the server
  }
}

function modificaPunteggioUser(punteggio) {
  return new Promise((resolve, reject) => {
    fetch(new URL("user/punteggio/" + punteggio, fixedURL), {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response
            .json()
            .then((obj) => {
              reject(obj);
            }) // error message in the response body
            .catch(() => {
              reject({ error: "Cannot parse server response." });
            }); // something else
        }
      })
      .catch(() => {
        reject({ error: "Cannot communicate with the server." });
      }); // connection errors
  });
}

const API = {
  logIn,
  logOut,
  getUserInfo,
  getAllIndovinelli,
  getIndovinelliFiltrati,
  aggiungiIndovinello,
  aggiungiRisposta,
  modificaIndovinello,
  getRisposte,
  modificaIndovinelloStato,
  modificaPunteggioUser,
  getTuttiUsers,
  getIndovinelliFiltratiAnonimi,
  nuovoIdIndovinello,
  getTimestamp,
};
export default API;
