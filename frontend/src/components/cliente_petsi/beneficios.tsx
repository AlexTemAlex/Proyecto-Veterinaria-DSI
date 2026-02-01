import './beneficios.css';
import dogImg from '../../assets/fonts/feather-icons/images/dog.png';
import facilitiesImg from '../../assets/fonts/feather-icons/images/facilities.png';
import hallwayImg from '../../assets/fonts/feather-icons/images/hallway.png';
import medicalEquipmentImg from '../../assets/fonts/feather-icons/images/medical-equipment.png';

export default function Beneficios() {
  return (
    <section className="beneficios" id="beneficios">
      <h2>Por qué elegir <span className="petsi-brand"><span className="pet-text">Pet</span><span className="si-text">SI</span></span></h2>
      
      <p>
        Nuestro compromiso es la salud y bienestar animal, respaldado por años de experiencia
        y tecnología de punta, inspirados en el amor por todas las especies.
      </p>

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
          <p>Equipos de diagnostico de última generación.</p>
        </div>

        <div className="beneficio-card">
          <div className="beneficio-image-container">
            <img src={hallwayImg} alt="Atención Humanizada" className="beneficio-image" />
          </div>
          <h3>Cuidado Humano</h3>
          <p>Un trato amable y delicado para cada mascota.</p>
        </div>

        <div className="beneficio-card">
          <div className="beneficio-image-container">
            <img src={medicalEquipmentImg} alt="Soporte 24/7" className="beneficio-image" />
          </div>
          <h3>Soporte 24/7</h3>
          <p>Atención de emergencias en cualquier momento.</p>
        </div>
      </div>
    </section>
  );
}
