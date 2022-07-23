import { Nav } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
function MySideBar(props) {
  const navigate = useNavigate();
  const { activeFilter } = useParams();

  let currentFilter = activeFilter
    ? activeFilter.replace("%20", " ")
    : "Tutti gli indovinelli";

  let filters;

  props.loggedIn
    ? (filters = ["Tutti gli indovinelli", "I miei indovinelli", "Classifica"])
    : (filters = ["Tutti gli indovinelli", "Classifica"]);

  let navLinks = [];

  filters.forEach((item, index) => {
    if (currentFilter === item)
      navLinks.push(
        <Nav.Link
          key={index}
          eventKey={index}
          className="bg-warning"
          onClick={() => {
            props.setFilter(currentFilter);

            props.loggedIn
              ? navigate(`/filter/${currentFilter}`)
              : navigate(`/anonimo/filter/${currentFilter}`);
          }}
        >
          <span className="text-dark">{item}</span>
        </Nav.Link>
      );
    else
      navLinks.push(
        <Nav.Link
          key={index}
          eventKey={index}
          onClick={() => {
            props.setFilter(item);

            props.loggedIn
              ? navigate(`/filter/${item}`)
              : navigate(`/anonimo/filter/${item}`);
          }}
        >
          <span className="text-dark">{item}</span>
        </Nav.Link>
      );
  });

  return (
    <Nav defaultActiveKey="/home" className="flex-column m-3">
      {navLinks}
    </Nav>
  );
}

export default MySideBar;
