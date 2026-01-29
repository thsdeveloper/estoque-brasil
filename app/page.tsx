import Header from "./components/Header";
import Hero from "./components/Hero";
import Problem from "./components/Problem";
import WhyChooseUs from "./components/WhyChooseUs";
import Authority from "./components/Authority";
import FeedGallery from "./components/FeedGallery";
import VideoGallery from "./components/VideoGallery";
import Testimonials from "./components/Testimonials";
import Clients from "./components/Clients";
import FAQ from "./components/FAQ";
import Regions from "./components/Regions";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Problem />
        <WhyChooseUs />
        <Testimonials />
        <Authority />
        <FeedGallery />
        <VideoGallery />
        <Clients />
        <FAQ />
        <Regions />
        <FinalCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
