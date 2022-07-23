import { Container, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API";

function FormIndovinello(props) {
  const [domanda, setDomanda] = useState("");
  const [difficoltà, setDifficoltà] = useState("");
  const [durata, setDurata] = useState(0);
  const [risposta, setRisposta] = useState("");
  const [suggerimentoUno, setSuggerimentoUno] = useState("");
  const [suggerimentoDue, setSuggerimentoDue] = useState("");

  const [errorMsg, setErrorMsg] = useState(""); // stringa vuota '' == non c'e' errore

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    const id = API.nuovoIdIndovinello();

    event.preventDefault();
    //validation
    if (domanda === "") {
      setErrorMsg("Errore: domanda vuota");
    } else if (difficoltà === "") {
      setErrorMsg("Errore: difficoltà non selezionata");
    } else if (durata === "") {
      setErrorMsg("Errore: durata vuota");
    } else if (durata < 30 || durata > 600) {
      setErrorMsg(
        "Errore: la durata deve essere compresa tra 30 e 600 secondi"
      );
    } else if (risposta === "") {
      setErrorMsg("Errore: risposta vuota");
    } else if (suggerimentoUno === "") {
      setErrorMsg("Errore: primo suggerimento vuoto");
    } else if (suggerimentoDue === "") {
      setErrorMsg("Errore: secondo suggerimento vuoto");
    } else {
      //add
      const newIndovinello = {
        id: id,
        domanda: domanda,
        stato: "aperto",
        difficoltà: difficoltà,
        durata: durata,
        risposta: risposta.toLowerCase(),
        suggerimentoUno: suggerimentoUno,
        suggerimentoDue: suggerimentoDue,
        timestamp: undefined,
      };
      API.aggiungiIndovinello(newIndovinello);

      props.aggiungiIndovinello(newIndovinello);
      navigate("/"); //torniamo alla home
    }
  };

  let titoloSchermata = "Aggiungi nuovo indovinello";
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
            <Form onSubmit={handleSubmit}>
              <Form.Group as={Col}>
                <Row className="mb-2">
                  <Col md={{ span: 1, offset: 3 }}>
                    <Form.Label>
                      <strong>Domanda</strong>
                    </Form.Label>
                  </Col>
                  <Col md={{ span: 5, offset: 0 }}>
                    <Form.Control
                      placeholder="Inserisci il testo dell'indovinello."
                      onChange={(ev) => setDomanda(ev.target.value)}
                    ></Form.Control>
                  </Col>
                </Row>
              </Form.Group>

              <Form.Group as={Col}>
                <Row className="mb-2">
                  <Col md={{ span: 1, offset: 3 }}>
                    <Form.Label>
                      <strong>Difficoltà</strong>
                    </Form.Label>
                  </Col>
                  <Col md={{ span: 5, offset: 0 }}>
                    <Form.Select
                      onChange={(ev) => setDifficoltà(ev.target.value)}
                    >
                      <option>Scegli la difficoltà</option>
                      <option value="facile">facile</option>
                      <option value="medio">medio</option>
                      <option value="difficile">difficile</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Form.Group>

              <Form.Group as={Col}>
                <Row className="mb-2">
                  <Col md={{ span: 1, offset: 3 }}>
                    <Form.Label>
                      <strong>Durata (in secondi)</strong>
                    </Form.Label>
                  </Col>
                  <Col md={{ span: 5, offset: 0 }}>
                    <Form.Control
                      type="number"
                      min={0}
                      step={60}
                      placeholder="Inserisci la durata in secondi (min: 30s, max: 600s)"
                      onChange={(ev) => setDurata(ev.target.value)}
                    />
                  </Col>
                </Row>
              </Form.Group>

              <Form.Group as={Col}>
                <Row className="mb-2">
                  <Col md={{ span: 1, offset: 3 }}>
                    <Form.Label>
                      <strong>Risposta</strong>
                    </Form.Label>
                  </Col>
                  <Col md={{ span: 5, offset: 0 }}>
                    <Form.Control
                      placeholder="Inserisci la risposta"
                      onChange={(ev) => setRisposta(ev.target.value)}
                    ></Form.Control>
                  </Col>
                </Row>
              </Form.Group>

              <Form.Group as={Col}>
                <Row className="mb-2">
                  <Col md={{ span: 1, offset: 3 }}>
                    <Form.Label>
                      <strong>Primo Suggerimento</strong>
                    </Form.Label>
                  </Col>
                  <Col md={{ span: 5, offset: 0 }}>
                    <Form.Control
                      placeholder="Inserisci il primo suggerimento"
                      onChange={(ev) => setSuggerimentoUno(ev.target.value)}
                    ></Form.Control>
                  </Col>
                </Row>
              </Form.Group>

              <Form.Group as={Col}>
                <Row className="mb-2">
                  <Col md={{ span: 1, offset: 3 }}>
                    <Form.Label>
                      <strong>Secondo Suggerimento</strong>
                    </Form.Label>
                  </Col>
                  <Col md={{ span: 5, offset: 0 }}>
                    <Form.Control
                      placeholder="Inserisci il secondo suggerimento"
                      onChange={(ev) => setSuggerimentoDue(ev.target.value)}
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
                  Salva
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

export default FormIndovinello;
