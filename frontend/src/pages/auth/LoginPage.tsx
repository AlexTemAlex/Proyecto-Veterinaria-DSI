import { useState } from "react";
import { Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import loginImage from '../../assets/fonts/feather-icons/images/image-login.png';
import '../../components/login_petsi/LoginPage.css';
import '../../components/login_petsi/LoginForm.css';

import { useMounted } from "../../hooks/useMounted";

export default function LoginPage() {
  const navigate = useNavigate();
  const hasMounted = useMounted();

  // Lógica de login del segundo
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", form.username);
      formData.append("password", form.password);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) throw new Error(data.detail || "Login failed");

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center">
      {/* Sección de Imagen y Logo estilo PETSI */}
      <div className="login-image-section">
        <div className="login-frame">
          <div className="login-image-container">
            <div className="login-logo">PETSI</div>
            <img src={loginImage} alt="PetSI Veterinaria" className="login-image" />
          </div>

          {/* Formulario con lógica real */}
          <Row className="align-items-center justify-content-center g-0">
            <Col xs={12}>
              <Card className="smooth-shadow-md">
                <Card.Body className="p-6">
                  <div className="mb-4 text-center">
                  <h1 className="login-title">¡Bienvenido a PETSI!</h1>
                  <div className="login-divider">
                    <span></span>
                    <span className="divider-dot">o</span>
                    <span></span>
                  </div>
                    <h2 className="login-subtitle">Inicia sesión</h2>
                  </div>

                  {error && <Alert className="login-error">{error}</Alert>}

                  {hasMounted && (
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Usuario o Correo Electrónico</Form.Label>
                        <Form.Control
                          type="email"
                          name="username"
                          placeholder="Ingrese su correo"
                          value={form.username}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Contraseña</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          placeholder="**************"
                          value={form.password}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>

                      <div className="form-footer mb-3">
                        <Link to="#" className="forgot-password">¿Olvidaste tu contraseña?</Link>
                      </div>

                      <div className="d-grid">
                        <Button  className="login-button" variant="primary" type="submit" disabled={isLoading}>
                          {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}