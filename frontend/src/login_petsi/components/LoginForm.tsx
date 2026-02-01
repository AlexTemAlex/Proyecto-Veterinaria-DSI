import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Conectar con endpoint real de autenticación
      // const response = await fetch('http://localhost:3001/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();
      // if (data.token) {
      //   localStorage.setItem('token', data.token);
      //   navigate('/dashboard');
      // }

      // Por ahora, simulamos login exitoso
      if (email && password) {
        localStorage.setItem('userEmail', email);
        navigate('/dashboard');
      } else {
        setError('Por favor completa todos los campos');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Intenta de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-wrapper">
      <div className="login-form-content">
        <h1 className="login-title">¡Bienvenido a PETSI!</h1>
        
        <div className="login-divider">
          <span></span>
          <span className="divider-dot">o</span>
          <span></span>
        </div>

        <h2 className="login-subtitle">Inicia sesión</h2>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Correo electrónico o nombre de usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-footer">
            <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
