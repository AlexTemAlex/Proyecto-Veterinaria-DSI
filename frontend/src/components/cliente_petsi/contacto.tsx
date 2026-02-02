import './contacto.css';

export default function Contacto() {
  return (
    <section className="contacto" id="contacto">
      <h2>Contáctanos</h2>

      <div className="contacto-grid">
        <div id="direccion">
          <h3>📍 Dirección</h3>
          <p>Av. Principal y Calle Mascotas, Loja</p>
        </div>

        <div>
          <h3>📞 Teléfono</h3>
          <p>+593 99 999 9999</p>
        </div>

        <div>
          <h3>✉️ Email</h3>
          <p>contacto@petsi.com</p>
        </div>
      </div>
    </section>
  );
}
