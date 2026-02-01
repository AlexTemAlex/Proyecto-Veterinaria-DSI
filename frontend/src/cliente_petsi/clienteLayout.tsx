import { Outlet } from "react-router-dom";
import './styles/global.css';

// componentes fijos del cliente
import NavbarCliente from "./components/navbar";
import Footer from "./components/footer";
import WhatsAppButton from "./components/whatsappButton";

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
