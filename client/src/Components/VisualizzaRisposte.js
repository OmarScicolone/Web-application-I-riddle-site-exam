import { Table, Button, Container, Col, Row } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../API";
import dayjs from "dayjs";

function VisualizzaRisposte(props) {
  const navigate = useNavigate();

  const [risposteVisualizzate, setRisposteVisualizzate] = useState("");

  const { idIndovinello } = useParams();

  const indovinelloDaVisualizzare = props.indovinelli.find(
    // eslint-disable-next-line
    (i) => i.id == idIndovinello
  );
  const [timestamp, setTimestamp] = useState(
    indovinelloDaVisualizzare.timestamp
      ? indovinelloDaVisualizzare.timestamp
      : null
  );
  const [durata, setDurata] = useState(
    timestamp
      ? indovinelloDaVisualizzare.durata - dayjs().diff(timestamp, "seconds")
      : indovinelloDaVisualizzare.durata
  );

  useEffect(() => {
    API.getRisposte(idIndovinello)
      .then((risposte) => {
        setRisposteVisualizzate(risposte);
      })
      .catch((err) => console.log(err));

    //qui mi sa che ci vuole una api che prende il nuovo timestamp
    API.getTimestamp(idIndovinello)
      .then((ts) => {
        if (ts.length) {
          setTimestamp(ts[0].timestamp);
        }
      })
      .catch((err) => console.log(err));

    if (durata > 0) {
      setDurata(
        timestamp
          ? indovinelloDaVisualizzare.durata -
              dayjs().diff(timestamp, "seconds")
          : indovinelloDaVisualizzare.durata
      );
    } else {
      navigate("/");
    }
    // eslint-disable-next-line
  }, [props.timer]);

  return (
    <>
      <Container fluid>
        <Row>
          <Col xs={9}>
            <main className="m-3">
              <h2>Risposte</h2>
              <TabellaRisposte
                risposteVisualizzate={risposteVisualizzate}
                setRisposteVisualizzate={setRisposteVisualizzate}
              ></TabellaRisposte>
            </main>
          </Col>
        </Row>
        <p className="m-3">Tempo rimanente: {durata}</p>
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

function TabellaRisposte(props) {
  return (
    <>
      <Table>
        <tbody>
          {props.risposteVisualizzate
            ? props.risposteVisualizzate.map((r) => (
                <RigaRisposte key={r.id} risposteVisualizzate={r} />
              ))
            : false}
        </tbody>
      </Table>
    </>
  );
}

function RigaRisposte(props) {
  return (
    <tr>
      <DatiRisposte risposteVisualizzate={props.risposteVisualizzate} />
    </tr>
  );
}

function DatiRisposte(props) {
  return (
    <>
      {props.risposteVisualizzate ? (
        <td>{props.risposteVisualizzate.risposta}</td>
      ) : (
        false
      )}
    </>
  );
}

export default VisualizzaRisposte;
