import './hero.css';
import veterinaryDoctor from '../../assets/fonts/feather-icons/images/veterinary-doctor.png';

function scrollAndHighlight(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('highlight-pulse');
    setTimeout(() => el.classList.remove('highlight-pulse'), 2000);
}

export default function hero() {
    return (
        <section className="hero">
            <div>
                <h1>
                    Hospital Veterinario <span className="petsi-brand"><span className="pet-text">Pet</span><span className="si-text">SI</span></span>: Excelencia para tu mejor amigo
                </h1>

                <p>
                    Brindamos atención médica de primer nivel con un enfoque en la confianza,
                    la limpieza y el bienestar integral de tu mascota.
                </p>

                <div className="hero-buttons">
                    <button className="btn-primary" onClick={() => scrollAndHighlight('reservar-cita')}>Comienza el Cuidado</button>
                    <button className="btn-secondary" onClick={() => scrollAndHighlight('direccion')}>Nuestras Instalaciones</button>
                </div>
            </div>

            <div className="hero-image">
                <img src={veterinaryDoctor} alt="Veterinario con mascota" />
            </div>
        </section>

    );
}
