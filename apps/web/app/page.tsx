import {
  Header,
  Hero,
  Problem,
  WhyChooseUs,
  Authority,
  FeedGallery,
  VideoGallery,
  Testimonials,
  Clients,
  FAQ,
  Regions,
  FinalCTA,
  Footer,
  FloatingWhatsApp,
  OrganizationSchema,
  LocalBusinessSchema,
  ServiceSchema,
  FAQSchema,
} from "@/features/marketing";

export default function Home() {
  return (
    <div className="min-h-screen">
      <OrganizationSchema />
      <LocalBusinessSchema />
      <ServiceSchema />
      <FAQSchema />
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
