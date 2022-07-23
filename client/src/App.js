import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { LoginForm } from "./Components/LoginComponents";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import API from "./API";
import MyMain from "./Components/Main";
import FormIndovinello from "./Components/FormIndovinello";
import FormRisposte from "./Components/FormRisposte";
import VisualizzaRisposte from "./Components/VisualizzaRisposte";
import VisualizzaRisultati from "./Components/VisualizzaRisultati";

function App() {
  return (
    <Router>
      <App2 />
    </Router>
  );
}

function App2() {
  const [indovinelli, setIndovinelli] = useState([]);
  const [risposte, setRisposte] = useState([]);
  const [users, setUsers] = useState([]);

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({});

  const [timer, setTimer] = useState(false);
  const [timerOn, setTimerOn] = useState(false);

  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {
        setUser(null);
        setLoggedIn(false);
      }
    };
    if (loggedIn) {
      setTimerOn(setInterval(() => setTimer((oldTimer) => !oldTimer), 1000));
      checkAuth();
    } else {
      clearInterval(timerOn);
    }

    const tuttiGliUtenti = async () => {
      try {
        const users = await API.getTuttiUsers();
        setUsers(users);
      } catch (err) {
        setUsers(null);
      }
    };
    if (loggedIn) {
      tuttiGliUtenti();
    }
    // eslint-disable-next-line
  }, [loggedIn]);

  function aggiungiIndovinello(indovinello) {
    setIndovinelli((oldIndovinelli) => [...oldIndovinelli, indovinello]);
  }

  function modificaIndovinello(indovinello) {
    setIndovinelli((oldIndovinelli) =>
      // eslint-disable-next-line
      oldIndovinelli.map((ind) =>
        ind.id === indovinello.id ? Object.assign({}, indovinello) : ind
      )
    );
  }

  function aggiungiRisposta(risposta) {
    setRisposte((oldRisposte) => [...oldRisposte, risposta]);
  }

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then((user) => {
        setLoggedIn(true);
        setUser(user);
        navigate("/");
      })
      .catch((err) => {
        setMessage(err);
      });
  };

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser({});
    setIndovinelli([]);
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            loggedIn ? (
              <MyMain
                loggedIn={loggedIn}
                risposte={risposte}
                timer={timer}
                logout={doLogOut}
                user={user}
                indovinelli={indovinelli}
                setIndovinelli={setIndovinelli}
                users={users}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/filter/:activeFilter"
          element={
            loggedIn ? (
              <MyMain
                loggedIn={loggedIn}
                risposte={risposte}
                timer={timer}
                logout={doLogOut}
                user={user}
                indovinelli={indovinelli}
                setIndovinelli={setIndovinelli}
                users={users}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* //anonimo */}
        <Route
          path="/anonimo"
          element={
            <MyMain
              loggedIn={loggedIn}
              risposte={risposte}
              timer={timer}
              logout={doLogOut}
              user={user}
              indovinelli={indovinelli}
              setIndovinelli={setIndovinelli}
              users={users}
            />
          }
        />
        <Route
          path="anonimo/filter/:activeFilter"
          element={
            <MyMain
              loggedIn={loggedIn}
              risposte={risposte}
              timer={timer}
              logout={doLogOut}
              user={user}
              indovinelli={indovinelli}
              setIndovinelli={setIndovinelli}
              users={users}
            />
          }
        />
        {/* //anonimo */}

        <Route
          path="/login"
          element={
            <LoginForm
              login={doLogIn}
              message={message}
              setMessage={setMessage}
            />
          }
        />
        <Route
          path="/add"
          element={
            loggedIn ? (
              <FormIndovinello
                indovinelli={indovinelli}
                aggiungiIndovinello={aggiungiIndovinello}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/risposta/:indovinelloId"
          element={
            loggedIn ? (
              <FormRisposte
                timer={timer}
                indovinelli={indovinelli}
                aggiungiRisposta={aggiungiRisposta}
                modificaIndovinello={modificaIndovinello}
                user={user}
                setUser={setUser}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/risposte/:idIndovinello"
          element={
            loggedIn ? (
              <VisualizzaRisposte
                timer={timer}
                indovinelli={indovinelli}
                risposte={risposte}
                setRisposte={setRisposte}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/risultati/:idIndovinello"
          element={
            loggedIn ? (
              <VisualizzaRisultati
                users={users}
                indovinelli={indovinelli}
                risposte={risposte}
                setRisposte={setRisposte}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
