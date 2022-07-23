import { Container, Col, Navbar } from "react-bootstrap";
import { LogoutButton } from "./LoginComponents";

function MyNavBar(props) {
  return (
    <Navbar bg="warning" variant="light">
      <Container fluid>
        <Col className="col-6 ">
          <Navbar.Brand>
            <i className="bi bi-question-lg"></i>
            <i className="bi bi-question-lg"></i>
            <i className="bi bi-question-lg"></i>
            Indovinelli
            <i className="bi bi-question-lg"></i>
            <i className="bi bi-question-lg"></i>
            <i className="bi bi-question-lg"></i>
          </Navbar.Brand>
        </Col>

        <Col className="col-6 d-flex justify-content-end ">
          <LogoutButton
            className="justify-content-end"
            loggedIn={props.loggedIn}
            logout={props.logout}
            user={props.user}
          />
        </Col>
      </Container>
    </Navbar>
  );
}

export default MyNavBar;
