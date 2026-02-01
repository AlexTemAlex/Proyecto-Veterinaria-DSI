//import node module libraries
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";

export default function AuthenticationLayout() {
  return (
    <section className="bg-light">
      <Container className="d-flex flex-column">
        <Outlet />
        
      </Container>
    </section>
  );
};
