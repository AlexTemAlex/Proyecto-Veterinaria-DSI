import { Outlet } from "react-router-dom";
import '../../components/styles/global.css';

// componentes fijos del cliente
import NavbarCliente from "../../components/cliente_petsi/navbar_home";
import Footer from "../../components/cliente_petsi/footer";
import WhatsAppButton from "../../components/cliente_petsi/whatsappButton";

export default function ClienteLayout() {
  return (
    <>
      {/* Navbar fijo */}
      <NavbarCliente />

      {/* Botón flotante WhatsApp */}
      <WhatsAppButton />

      {/* Contenido dinámico */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
