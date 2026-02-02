import Navbar from '../../components/cliente_petsi/navbar_home';
import Hero from '../../components/cliente_petsi/hero';
import Servicios from '../../components/cliente_petsi/servicios';
import Beneficios from '../../components/cliente_petsi/beneficios';
import CTA from '../../components/cliente_petsi/cta';
import Contacto from '../../components/cliente_petsi/contacto';
import WhatsAppButton from '../../components/cliente_petsi/whatsappButton';

export default function HomeCliente() {
  return (
    <>
      <Navbar />

      <main style={{ paddingTop: "70px", background: "linear-gradient(135deg, #f8fafc, #eef2ff)" }}>
        <Hero />
        <Servicios />
        <Beneficios />
        <CTA />
        <Contacto />
        <WhatsAppButton />
      </main>
    </>
  );
}
