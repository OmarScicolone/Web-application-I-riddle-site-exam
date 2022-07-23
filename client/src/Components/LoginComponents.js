import { Form, Button, Alert, Container } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginForm(props) {
  const [username, setUsername] = useState("u1@p.it"); //due stati -> username...
  const [password, setPassword] = useState("psw"); //... e password
  const [errorMsg, setErrorMsg] = useState(""); //oltre a questo stato per il controllo di errore, ne è stato passato
  //un altro come props, per eventuali errori di autenticazione

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMsg("");
    props.setMessage("");
    const credentials = { username, password };

    if (username === "" || password === "") {
      setErrorMsg("Campi vuoti non ammessi");
    } else if (!username.includes("@")) {
      setErrorMsg("Manca la @ nell'e-mail");
    } else {
      props.login(credentials); //qui dentro c'è username e password
    }
  };

  return (
    <Container>
      <div className="login-container">
        <h2>Login</h2>
        <Form onSubmit={handleSubmit}>
          {errorMsg ? (
            <Alert onClose={() => setErrorMsg("")} dismissible variant="danger">
              {errorMsg}
            </Alert>
          ) : (
            ""
          )}
          {props.message ? (
            <Alert
              onClose={() => props.setMessage("")}
              dismissible
              variant="danger"
            >
              {props.message}
            </Alert>
          ) : (
            ""
          )}
          <div>
            <Form.Group controlId="username">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                value={username}
                onChange={(ev) => setUsername(ev.target.value)}
              />
            </Form.Group>
          </div>
          <div>
            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
              />
            </Form.Group>
          </div>
          <br />
          <Button variant="warning" type="submit" onClick={handleSubmit}>
            Login
          </Button>

          <br />
          <br />

          <Button variant="secondary" onClick={() => navigate("/anonimo")}>
            Accedi come ospite
          </Button>
        </Form>
      </div>
    </Container>
  );
}

function LogoutButton(props) {
  const navigate = useNavigate();
  return props.loggedIn ? (
    <>
      <i className="bi bi-person-circle mt-2"></i>
      <span className="m-2 mt-2">Benvenuto {props.user.nome}</span>
      <Button variant="outline-dark" onClick={props.logout}>
        Logout
      </Button>
    </>
  ) : (
    <Button variant="outline-dark" onClick={() => navigate("/")}>
      Torna al login
    </Button>
  );
}

export { LoginForm, LogoutButton };
