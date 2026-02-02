import './cta.css';

export default function cta() {
  return (
    <section className="cta" id="reservar-cita">
      <h2>¿Listo para brindarle lo mejor a tu mascota?</h2>
      <p>Reserva hoy mismo una consulta preventiva en PetSI y mantén a tu
mejor amigo sano y feliz.
      </p>

      <button
        className="cta-btn"
        onClick={() => window.open("https://wa.me/593995521989?text=Hola%2C%20quiero%20reservar%20una%20cita", "_blank")}
      >
        Reservar cita
      </button>
    </section>
  );
}
