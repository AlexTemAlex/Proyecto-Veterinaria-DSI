import './hero.css';
import veterinaryDoctor from '../../assets/fonts/feather-icons/images/veterinary-doctor.png';

export default function hero() {
    return (
        <section className="hero">
            <div>
                <h1>
                    Hospital Veterinario <span className="petsi-brand"><span className="pet-text">Pet</span><span className="si-text">SI</span></span>: Excelencia para tu mejor amigo
                </h1>

                <p>
                    Brindamos atención médica de primer nivel con enfoque en confianza,
                    limpieza y bienestar integral.
                </p>

                <div className="hero-buttons">
                    <button className="btn-primary">Comienza el Cuidado</button>
                    <button className="btn-secondary">Nuestras Instalaciones</button>
                </div>
            </div>

            <div className="hero-image">
                <img src={veterinaryDoctor} alt="Veterinario con mascota" />
            </div>
        </section>

    );
}
