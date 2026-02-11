import { motion } from "framer-motion";
import designerPortrait from "@/assets/designer-portrait.jpg";

const AboutSection = () => {
  return (
    <section id="about" className="py-24 md:py-32 bg-secondary">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={designerPortrait}
                alt="Fashion designer portrait"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="font-body text-xs tracking-[0.4em] uppercase text-muted-foreground">
              The Designer
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-foreground">
              A Vision of
              <br />
              <em className="font-light">Modern Elegance</em>
            </h2>
            <div className="w-12 h-px bg-foreground" />
            <p className="font-body text-base leading-relaxed text-muted-foreground max-w-lg">
              With over a decade of experience in haute couture, our designer crafts 
              pieces that blur the line between art and fashion. Each garment is 
              meticulously constructed, drawing inspiration from architectural forms 
              and the poetry of movement.
            </p>
            <p className="font-body text-base leading-relaxed text-muted-foreground max-w-lg">
              Trained at the finest ateliers in Paris and Milan, the vision is clear: 
              fashion should empower, transform, and transcend the ordinary.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
