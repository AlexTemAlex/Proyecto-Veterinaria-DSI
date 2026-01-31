import { useState } from "react";
import { Container, Row, Col, Form, InputGroup } from "react-bootstrap";
import { Search } from "react-feather";
import InventarioTable from "sub-components/inventario/InventarioTable";

const Inventario = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Container fluid className="p-6">
      <Row>
        <Col lg={12} md={12} xs={12}>
          <div className="border-bottom pb-4 mb-4 d-flex justify-content-between align-items-center">
            <h3 className="mb-0 fw-bold">Inventario</h3>
            <InputGroup style={{ maxWidth: "280px" }}>
              <InputGroup.Text className="bg-white border-end-0">
                <Search size={16} className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar producto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0"
              />
            </InputGroup>
          </div>
        </Col>
      </Row>
      <InventarioTable searchTerm={searchTerm} />
    </Container>
  );
};

export default Inventario;
