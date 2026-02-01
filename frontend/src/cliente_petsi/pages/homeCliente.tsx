import Navbar from '../components/navbar';
import Hero from '../components/hero';
import Servicios from '../components/servicios';
import Beneficios from '../components/beneficios';
import CTA from '../components/cta';
import Contacto from '../components/contacto';
import WhatsAppButton from '../components/whatsappButton';


export default function HomeCliente() {
  return (
    <>
      <Navbar />

      <main>
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
