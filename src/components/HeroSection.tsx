import heroImage from "@/assets/hero-fashion.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Avant-garde couture fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/40" />
      </div>

      {/* Big bold background logo (static, faded) */}
      <img
        src="/logo.PNG" // Make sure logo is in public/logo.PNG
        alt="Matteekay Logo"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[80%] opacity-10 select-none pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">

     {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-body text-[10px] tracking-[0.3em] uppercase text-primary-foreground/60">
          Scroll
        </span>
        <div className="w-px h-8 bg-primary-foreground/40" />
      </div>

        <h1 className="font-brand text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-primary-foreground tracking-[0.12em]" style={{ fontFamily: 'Playfair Display, serif' }}>
          MATTEEKAY
        </h1>
        <br />

            
   <a
          href="#collection"
          className="font-body text-xs tracking-[0.3em] uppercase px-10 py-4 border border-primary-foreground/60 text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all duration-500"
        >
          View Collection
        </a>

    

    

     
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-1/4 left-[10%] w-px h-32 bg-primary-foreground/20 hidden md:block" />
      <div className="absolute top-1/3 right-[8%] w-px h-24 bg-primary-foreground/20 hidden md:block" />

     
    </section>
  );
};

export default HeroSection;
