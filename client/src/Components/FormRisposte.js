import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../API";
import dayjs from "dayjs";
import { Container, Form, Button, Row, Col, Alert } from "react-bootstrap";

function FormRisposte(props) {
  const { indovinelloId } = useParams();

  /* risposta che si sta per inserire */
  const [risposta, setRisposta] = useState("");

  /* indovinello a cui si sta rispondendo */
  const indovinelloDaRispondere = props.indovinelli.find(
    // eslint-disable-next-line
    (i) => i.id == indovinelloId
  );

  const [timestamp, setTimestamp] = useState(
    indovinelloDaRispondere.timestamp ? indovinelloDaRispondere.timestamp : null
  );
  // eslint-disable-next-line
  const [testo, setTesto] = useState(indovinelloDaRispondere.domanda);
  const [durata, setDurata] = useState(
    timestamp
      ? indovinelloDaRispondere.durata - dayjs().diff(timestamp, "seconds")
      : indovinelloDaRispondere.durata
  );
  const [suggUno, setSuggUno] = useState("");
  const [suggDue, setSuggDue] = useState("");

  /* Utente che sta rispondendo */
  const userDaAggiornare = props.user;

  // eslint-disable-next-line
  const [punteggio, setPunteggio] = useState(userDaAggiornare.punteggio);

  const [errorMsg, setErrorMsg] = useState(""); // stringa vuota '' = non c'e' errore

  const navigate = useNavigate();

  useEffect(() => {
    API.getTimestamp(indovinelloDaRispondere.id)
      .then((ts) => {
        if (ts.length) {
          setTimestamp(ts[0].timestamp);
        }
      })
      .catch((err) => console.log(err));

    if (timestamp !== null) {
      if (durata > 0) {
        setDurata(
          indovinelloDaRispondere.durata - dayjs().diff(timestamp, "seconds")
        );

        if (durata <= indovinelloDaRispondere.durata / 2) {
          setSuggUno(indovinelloDaRispondere.suggerimentoUno);
        }

        if (durata <= indovinelloDaRispondere.durata / 4) {
          setSuggDue(indovinelloDaRispondere.suggerimentoDue);
        }
      } else {
        API.modificaIndovinelloStato(indovinelloDaRispondere.id);
        props.modificaIndovinello(indovinelloDaRispondere);
        navigate("/");
      }
    }
    // eslint-disable-next-line
  }, [props.timer]);

  const handleSubmit = (event) => {
    event.preventDefault();
    //validation
    if (risposta === "") {
      setErrorMsg("Testo risposta vuoto");
    } else {
      const nuovaRisposta = {
        idIndovinello: indovinelloId,
        idUser: props.user.id,
        risposta: risposta.toLowerCase(),
      };

      if (timestamp === null) {
        API.modificaIndovinello(indovinelloId);
        props.modificaIndovinello(indovinelloDaRispondere);
      }

      API.aggiungiRisposta(nuovaRisposta);
      props.aggiungiRisposta(nuovaRisposta);

      //Risposta corretta
      if (risposta.toLowerCase() === indovinelloDaRispondere.risposta) {
        switch (indovinelloDaRispondere.difficoltà) {
          case "facile":
            API.modificaPunteggioUser(punteggio + 1);
            userDaAggiornare.punteggio += 1;
            props.setUser(userDaAggiornare);
            break;
          case "medio":
            API.modificaPunteggioUser(punteggio + 2);
            userDaAggiornare.punteggio += 2;
            props.setUser(userDaAggiornare);
            break;
          case "difficile":
            API.modificaPunteggioUser(punteggio + 3);
            userDaAggiornare.punteggio += 3;
            props.setUser(userDaAggiornare);
            break;

          default:
            console.log("default");
        }

        API.modificaIndovinelloStato(indovinelloId);
        props.modificaIndovinello(indovinelloDaRispondere);
      }

      navigate("/"); //torniamo alla home
    }
  };

  let titoloSchermata = "Rispondi";

  return (
    <>
      <Container>
        <Row>
          <Col md={{ span: 6, offset: 3 }} align="center">
            <main className="m-3">
              <h3>{titoloSchermata}</h3>
            </main>
          </Col>
        </Row>
      </Container>

      <Container>
        <Row>
          <Col>
            <Col md={{ span: 6, offset: 3 }}>
              {errorMsg ? (
                <Alert
                  variant="danger"
                  onClose={() => setErrorMsg("")}
                  dismissible
                >
                  {errorMsg}
                </Alert>
              ) : (
                false
              )}
            </Col>

            <Row className="mb-2">
              <Col md={{ span: 1, offset: 3 }}>
                <strong>Testo Indovinello:</strong>
              </Col>
              <Col md={{ span: 5, offset: 1 }}>{testo}</Col>
            </Row>

            <Row className="mb-2">
              <Col md={{ span: 1, offset: 3 }}>
                <strong>Durata:</strong>
              </Col>
              <Col md={{ span: 5, offset: 1 }}>{durata}</Col>
            </Row>

            <Row className="mb-2">
              <Col md={{ span: 1, offset: 3 }}>
                <strong>Suggerimento Uno:</strong>
              </Col>
              <Col md={{ span: 5, offset: 1 }}>{suggUno}</Col>
            </Row>

            <Row className="mb-2">
              <Col md={{ span: 1, offset: 3 }}>
                <strong>Suggerimento Due:</strong>
              </Col>
              <Col md={{ span: 5, offset: 1 }}>{suggDue}</Col>
            </Row>

            <Form onSubmit={handleSubmit}>
              <Form.Group as={Col}>
                <Row className="mb-2">
                  <Col md={{ span: 1, offset: 3 }}>
                    <Form.Label>
                      <strong>Risposta</strong>
                    </Form.Label>
                  </Col>
                  <Col md={{ span: 5, offset: 1 }}>
                    <Form.Control
                      value={risposta}
                      onChange={(ev) => setRisposta(ev.target.value)}
                    ></Form.Control>
                  </Col>
                </Row>
              </Form.Group>
              <div align="center">
                <Button
                  type="submit"
                  className="ms-10"
                  size="md"
                  variant="warning"
                  onClick={handleSubmit}
                >
                  Invia Risposta
                </Button>
                <Button
                  className="m-2"
                  size="md"
                  variant="secondary"
                  onClick={() => navigate("/")}
                >
                  Annulla
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default FormRisposte;
