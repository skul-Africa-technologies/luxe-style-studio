const Footer = () => {
  return (
    <footer className="border-t border-border py-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-display text-xl tracking-wider text-foreground">MAISON</span>
        <span className="font-body text-xs tracking-wider text-muted-foreground">
          © 2026 Maison. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
