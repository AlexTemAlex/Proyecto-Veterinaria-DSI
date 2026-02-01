import logoPetSI from "../../assets/fonts/feather-icons/icons/logoPetSI.svg";
<<<<<<< HEAD:frontend/src/cliente_petsi/components/navbar.tsx
import { useNavigate } from 'react-router-dom';
import './navbar.css';
=======
import { Link } from "react-router-dom";

import './navbar_home.css';
>>>>>>> main:frontend/src/components/cliente_petsi/navbar_home.tsx

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
    <nav className="navbar2">

      <div className="navbar2-brand">
        <img src={logoPetSI} alt="PetSI" className="navbar2-logo-img"  />
        <span className="navbar2-logo-text"><span className="pet-text">Pet</span><span className="si-text">SI</span></span>
      </div>

      <ul className="navbar2-links">
        <li><a href="#servicios" onClick={(e) => { e.preventDefault(); handleNavClick('servicios'); }} className="nav-link">Servicios</a></li>
        <li><a href="#beneficios" onClick={(e) => { e.preventDefault(); handleNavClick('beneficios'); }} className="nav-link">Nosotros</a></li>
        <li><a href="#contacto" onClick={(e) => { e.preventDefault(); handleNavClick('contacto'); }} className="nav-link">Contacto</a></li>
<<<<<<< HEAD:frontend/src/cliente_petsi/components/navbar.tsx
        <li>
          <button className="btn-primary" onClick={handleLoginClick}>Iniciar sesión</button>
        </li>
=======
        <li><Link to="/auth/sign-in" className="btn-primary"> Iniciar sesión </Link></li>
>>>>>>> main:frontend/src/components/cliente_petsi/navbar_home.tsx
      </ul>
    </nav>
  );
}
