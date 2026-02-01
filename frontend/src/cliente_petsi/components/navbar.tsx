import logoPetSI from "../../assets/fonts/feather-icons/icons/logoPetSI.svg";
import { useNavigate } from 'react-router-dom';
import './navbar.css';

export default function navbar() {
  const navigate = useNavigate();

  const handleNavClick = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoginClick = () => {
    navigate('/auth/login');
  };

  return (
    <nav className="navbar">

      <div className="navbar-brand">
        <img src={logoPetSI} alt="PetSI" className="navbar-logo-img"  />
        <span className="navbar-logo-text"><span className="pet-text">Pet</span><span className="si-text">SI</span></span>
      </div>

      <ul className="navbar-links">
        <li><a href="#servicios" onClick={(e) => { e.preventDefault(); handleNavClick('servicios'); }} className="nav-link">Servicios</a></li>
        <li><a href="#beneficios" onClick={(e) => { e.preventDefault(); handleNavClick('beneficios'); }} className="nav-link">Nosotros</a></li>
        <li><a href="#contacto" onClick={(e) => { e.preventDefault(); handleNavClick('contacto'); }} className="nav-link">Contacto</a></li>
        <li>
          <button className="btn-primary" onClick={handleLoginClick}>Iniciar sesión</button>
        </li>
      </ul>
    </nav>
  );
}
