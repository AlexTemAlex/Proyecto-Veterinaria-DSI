import './beneficios.css';
import dogImg from '../../assets/fonts/feather-icons/images/dog.png';
import facilitiesImg from '../../assets/fonts/feather-icons/images/facilities.png';
import hallwayImg from '../../assets/fonts/feather-icons/images/hallway.png';
import medicalEquipmentImg from '../../assets/fonts/feather-icons/images/medical-equipment.png';

export default function Beneficios() {
  return (
    <section className="beneficios" id="beneficios">
      <h2>Por qué elegir PetSI</h2>

      <div className="beneficios-grid">
        <div className="beneficio-card">
          <div className="beneficio-image-container">
            <img src={dogImg} alt="Veterinarios Expertos" className="beneficio-image" />
          </div>
          <h3>Veterinarios Expertos</h3>
          <p>Profesionales certificados y con experiencia.</p>
        </div>

        <div className="beneficio-card">
          <div className="beneficio-image-container">
            <img src={facilitiesImg} alt="Instalaciones Modernas" className="beneficio-image" />
          </div>
          <h3>Instalaciones Modernas</h3>
          <p>Equipamiento de última generación.</p>
        </div>

        <div className="beneficio-card">
          <div className="beneficio-image-container">
            <img src={hallwayImg} alt="Atención Humanizada" className="beneficio-image" />
          </div>
          <h3>Atención Humanizada</h3>
          <p>Cuidamos a tu mascota como parte de la familia.</p>
        </div>

        <div className="beneficio-card">
          <div className="beneficio-image-container">
            <img src={medicalEquipmentImg} alt="Soporte 24/7" className="beneficio-image" />
          </div>
          <h3>Soporte 24/7</h3>
          <p>Siempre disponibles cuando lo necesites.</p>
        </div>
      </div>
    </section>
  );
}
