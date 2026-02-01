import './servicios.css';
import estetoscopio from '../../assets/fonts/feather-icons/icons/estetoscopio.svg';
import jeringa from '../../assets/fonts/feather-icons/icons/jeringa.svg';
import cirugia from '../../assets/fonts/feather-icons/icons/cirugia.svg';
import peluqueria from '../../assets/fonts/feather-icons/icons/peluqueria.svg';

export default function Servicios() {
  return (
    <section className="servicios" id="servicios">
      <h2>Nuestros Servicios</h2>

      <div className="servicios-grid">
        <div className="servicio-card">
          <img src={estetoscopio} alt="Consulta General" className="servicio-icon" />
          <h3>Consulta General</h3>
          <p>Chequeos médicos completos</p>
        </div>

        <div className="servicio-card">
          <img src={jeringa} alt="Vacunación" className="servicio-icon" />
          <h3>Vacunación</h3>
          <p>Protección esencial</p>
        </div>

        <div className="servicio-card">
          <img src={cirugia} alt="Cirugía" className="servicio-icon" />
          <h3>Cirugía</h3>
          <p>Procedimientos avanzados</p>
        </div>

        <div className="servicio-card">
          <img src={peluqueria} alt="Peluquería" className="servicio-icon" />
          <h3>Peluquería</h3>
          <p>Cuidado e higiene</p>
        </div>
      </div>
    </section>
  );
}
