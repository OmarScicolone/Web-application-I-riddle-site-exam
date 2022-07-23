import { Table, Button, Container, Col, Row } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import API from "../API";

function VisualizzaRisultati(props) {
  const navigate = useNavigate();

  const [risultatiVisualizzati, setRisultatiVisualizzati] = useState("");

  const { idIndovinello } = useParams();

  const indovinello = props.indovinelli.find(
    // eslint-disable-next-line
    (i) => i.id == idIndovinello
  );

  const rispostaCorretta = props.risposte.find(
    // eslint-disable-next-line
    (r) => r.risposta == indovinello.risposta
  );

  let utente = "";

  if (rispostaCorretta) {
    utente = props.users.find(
      // eslint-disable-next-line
      (u) => u.id == rispostaCorretta.idUser
    );
  }

  API.getRisposte(idIndovinello)
    .then((risultati) => setRisultatiVisualizzati(risultati))
    .catch((err) => console.log(err));

  return (
    <>
      <Container fluid>
        <Row>
          <Col xs={9}>
            <main className="m-3">
              <h2>Risultati</h2>
              <TabellaRisultati
                risultatiVisualizzati={risultatiVisualizzati}
                users={props.users}
              ></TabellaRisultati>
            </main>
          </Col>
        </Row>
        <Row>
          <Col xs={9}>
            <p className="m-3">
              {" "}
              <strong>Risposta Esatta: </strong> {indovinello.risposta}
            </p>
          </Col>
        </Row>
        <Row>
          <Col xs={9}>
            {utente ? (
              <p className="m-3">
                <strong>Vincitore: </strong> {utente.nome}
              </p>
            ) : (
              <p className="m-3">
                {" "}
                <strong>Vincitore: </strong>Nessun vincitore
              </p>
            )}
          </Col>
        </Row>
        <Button
          className="m-3"
          size="md"
          variant="warning"
          onClick={() => navigate("/")}
        >
          Home
        </Button>
      </Container>
    </>
  );
}

function TabellaRisultati(props) {
  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>Risposta</th>
            <th>Utente</th>
          </tr>
        </thead>
        <tbody>
          {props.risultatiVisualizzati
            ? props.risultatiVisualizzati.map((r) => (
                <RigaRisultati
                  key={r.id}
                  risultatiVisualizzati={r}
                  users={props.users}
                />
              ))
            : false}
        </tbody>
      </Table>
    </>
  );
}

function RigaRisultati(props) {
  return (
    <tr>
      <DatiRisultati
        risultatiVisualizzati={props.risultatiVisualizzati}
        users={props.users}
      />
    </tr>
  );
}

function DatiRisultati(props) {
  const utente = props.users.find(
    // eslint-disable-next-line
    (u) => u.id == props.risultatiVisualizzati.idUser
  );

  return (
    <>
      {props.risultatiVisualizzati ? (
        <td>{props.risultatiVisualizzati.risposta}</td>
      ) : (
        false
      )}
      {props.risultatiVisualizzati ? <td>{utente.nome}</td> : false}
    </>
  );
}

export default VisualizzaRisultati;
