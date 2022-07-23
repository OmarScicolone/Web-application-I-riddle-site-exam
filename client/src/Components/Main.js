import { Table, Button, Container, Col, Row } from "react-bootstrap";
import dayjs from "dayjs";

import MyNavBar from "./Navbar";
import MySideBar from "./Sidebar";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../API";

function MyMain(props) {
  const { setIndovinelli } = props;

  const { activeFilter } = useParams();
  const [filter, setFilter] = useState(
    activeFilter ? activeFilter : "Tutti gli indovinelli"
  );

  useEffect(() => {
    if (props.loggedIn)
      API.getIndovinelliFiltrati(filter)
        .then((indovinelli) => setIndovinelli(indovinelli))
        .catch((err) => console.log(err));
    else
      API.getIndovinelliFiltratiAnonimi(filter)
        .then((indovinelli) => setIndovinelli(indovinelli))
        .catch((err) => console.log(err));

    setIndovinelli((oldIndovinelli) => {
      let tmpDurata;
      const indovinelli = oldIndovinelli.map((item, j) => {
        if (item.timestamp !== null) {
          tmpDurata = item.durata - dayjs().diff(item.timestamp, "seconds");
          // eslint-disable-next-line
          if (item.stato == "aperto") {
            if (tmpDurata <= 0) {
              API.modificaIndovinelloStato(item.id).then(
                () => (item.stato = "chiuso")
              );
            }
          }
          return item;
        } else {
          return item;
        }
      });
      return indovinelli;
    });
  }, [props.timer, filter, props.loggedIn, setIndovinelli]); //gli altri rendono più veloce l'aggiornamento

  if (filter === "Classifica") {
    return (
      <>
        <MyNavBar
          loggedIn={props.loggedIn}
          logout={props.logout}
          user={props.user}
        />
        <Container fluid>
          <Row>
            <Col xs={3} className="bg-light">
              <MySideBar
                loggedIn={props.loggedIn}
                setFilter={setFilter}
              ></MySideBar>
            </Col>

            <Col xs={9}>
              <main className="m-3">
                <h2>
                  {activeFilter
                    ? activeFilter.replace("%20", " ")
                    : "Tutti gli indovinelli"}
                </h2>

                <Classifica classifica={props.indovinelli}></Classifica>
              </main>
            </Col>
          </Row>
        </Container>
      </>
    );
  } else {
    return (
      <>
        <MyNavBar
          loggedIn={props.loggedIn}
          logout={props.logout}
          user={props.user}
        />
        <Container fluid>
          <Row>
            <Col xs={3} className="bg-light">
              <MySideBar
                loggedIn={props.loggedIn}
                setFilter={setFilter}
              ></MySideBar>
            </Col>

            <Col xs={9}>
              <main className="m-3">
                <h2>
                  {activeFilter
                    ? activeFilter.replace("%20", " ")
                    : "Tutti gli indovinelli"}
                </h2>

                <br></br>
                <h3>Aperti</h3>
                <TabellaIndovinelli
                  loggedIn={props.loggedIn}
                  risposte={props.risposte}
                  user={props.user}
                  stato={"aperto"}
                  indovinelli={props.indovinelli}
                  setIndovinelli={props.setIndovinelli}
                  users={props.users}
                  activeFilter={activeFilter}
                ></TabellaIndovinelli>

                <br></br>
                <br></br>
                <h3>Chiusi</h3>
                <TabellaIndovinelli
                  loggedIn={props.loggedIn}
                  risposte={props.risposte}
                  user={props.user}
                  stato={"chiuso"}
                  indovinelli={props.indovinelli}
                  setIndovinelli={props.setIndovinelli}
                  users={props.users}
                  activeFilter={activeFilter}
                ></TabellaIndovinelli>
              </main>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
}

function Classifica(props) {
  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>Utente</th>
            <th>Punteggio</th>
            <th>Posizione</th>
          </tr>
        </thead>
        <tbody>
          {props.classifica.map((u) => (
            <RigaClassifica key={u.id} utente={u} />
          ))}
        </tbody>
      </Table>
    </>
  );
}
function RigaClassifica(props) {
  return (
    <tr>
      <DatiUtente utente={props.utente} />
    </tr>
  );
}
function DatiUtente(props) {
  return (
    <>
      <td>{props.utente.nome}</td>
      <td>{props.utente.punteggio}</td>
      <td>{props.utente.posizione}</td>
    </>
  );
}

function TabellaIndovinelli(props) {
  const navigate = useNavigate();

  let tabellaAperti = false;
  if (props.stato === "aperto") tabellaAperti = true;

  let mieiInd = false;
  if (props.activeFilter === "I miei indovinelli") {
    mieiInd = true;
  }

  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>Domanda</th>
            <th>Difficoltà</th>

            {props.loggedIn ? mieiInd ? false : <th>Autore</th> : false}
            {props.loggedIn ? (
              tabellaAperti ? (
                <th>Rispondi</th>
              ) : (
                <th>Risultati</th>
              )
            ) : (
              false
            )}
          </tr>
        </thead>
        <tbody>
          {props.indovinelli
            .filter((i) => i.stato === props.stato)
            .map((i) => (
              <RigaIndovinelli
                key={i.id}
                loggedIn={props.loggedIn}
                indovinelli={i}
                user={props.user}
                tabellaAperti={tabellaAperti}
                risposte={props.risposte}
                users={props.users}
                activeFilter={props.activeFilter}
              />
            ))}
        </tbody>
      </Table>
      {props.loggedIn ? (
        tabellaAperti ? (
          <Button
            onClick={() => navigate("/add")}
            className="btn float-end"
            variant="outline-dark"
          >
            Aggiungi indovinelli
          </Button>
        ) : (
          false
        )
      ) : (
        false
      )}
    </>
  );
}

function RigaIndovinelli(props) {
  return (
    <tr>
      <DatiIndovinelli
        loggedIn={props.loggedIn}
        risposte={props.risposte}
        tabellaAperti={props.tabellaAperti}
        indovinelli={props.indovinelli}
        user={props.user}
        users={props.users}
        activeFilter={props.activeFilter}
      />
    </tr>
  );
}

function DatiIndovinelli(props) {
  const navigate = useNavigate();
  let autore;
  if (props.indovinelli.user === props.user.id) {
    autore = true;
  }

  let rispostaGiaData = false;
  props.risposte.forEach((element) => {
    if (
      // eslint-disable-next-line
      element.idIndovinello == props.indovinelli.id &&
      // eslint-disable-next-line
      element.idUser == props.user.id
    ) {
      rispostaGiaData = true;
    }
  });

  let nomeAutore;
  props.users.forEach((u) => {
    // eslint-disable-next-line
    if (u.id == props.indovinelli.user) {
      nomeAutore = u.nome;
    }
  });

  let mieiInd = false;
  if (props.activeFilter === "I miei indovinelli") {
    mieiInd = true;
  }

  return (
    <>
      <td>{props.indovinelli.domanda}</td>
      <td>{props.indovinelli.difficoltà}</td>

      {props.loggedIn ? mieiInd ? true : <td>{nomeAutore}</td> : false}

      {props.loggedIn ? (
        props.tabellaAperti ? (
          rispostaGiaData ? (
            <td>
              <Button variant="outline-dark" disabled>
                Hai già risposto
              </Button>
            </td>
          ) : autore ? (
            <td>
              <Button
                variant="outline-dark"
                size="sm"
                onClick={() => navigate(`/risposte/${props.indovinelli.id}`)}
              >
                Vedi Risposte
              </Button>
            </td>
          ) : (
            <td>
              <Button
                onClick={() => navigate(`/risposta/${props.indovinelli.id}`)}
                variant="outline-dark"
              >
                Rispondi
              </Button>
            </td>
          )
        ) : (
          <td>
            <Button
              variant="outline-dark"
              size="sm"
              onClick={() => navigate(`/risultati/${props.indovinelli.id}`)}
            >
              Vedi Risultati
            </Button>
          </td>
        )
      ) : (
        false
      )}
    </>
  );
}

export default MyMain;
