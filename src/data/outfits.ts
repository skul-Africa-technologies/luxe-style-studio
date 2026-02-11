import outfit1 from "@/assets/outfit-1.jpg";
import outfit2 from "@/assets/outfit-2.jpg";
import outfit3 from "@/assets/outfit-3.jpg";
import outfit4 from "@/assets/outfit-4.jpg";
import outfit5 from "@/assets/outfit-5.jpg";
import outfit6 from "@/assets/outfit-6.jpg";

export interface Outfit {
  id: string;
  image: string;
  name: string;
  price: string;
  rating: number;
  description: string;
  fabric: string;
  style: string;
  category: string;
}

export const outfits: Outfit[] = [
  { id: "noir-satin-gown", image: outfit1, name: "Noir Satin Gown", price: "$4,200", rating: 5, description: "A breathtaking floor-length gown crafted from the finest Italian satin. The flowing silhouette drapes effortlessly, creating an aura of timeless sophistication perfect for black-tie events.", fabric: "Italian Satin", style: "Evening Gown", category: "Women" },
  { id: "ivory-tailored-suit", image: outfit2, name: "Ivory Tailored Suit", price: "$3,800", rating: 4, description: "Precision-cut ivory suit featuring a structured blazer with peak lapels and slim-fit trousers. A modern take on classic tailoring that commands attention.", fabric: "Wool Blend", style: "Tailored Suit", category: "Unisex" },
  { id: "gold-silk-drape", image: outfit3, name: "Gold Silk Drape", price: "$5,600", rating: 5, description: "Luxurious gold silk cascades in artful drapes, catching light with every movement. An opulent masterpiece that embodies the essence of haute couture.", fabric: "Pure Silk", style: "Draped Dress", category: "Women" },
  { id: "structured-blazer", image: outfit4, name: "Structured Blazer", price: "$2,900", rating: 4, description: "Architectural lines meet premium craftsmanship in this statement blazer. Double-breasted with horn buttons and a sculpted shoulder for a powerful silhouette.", fabric: "Cashmere Blend", style: "Blazer", category: "Unisex" },
  { id: "classic-trench", image: outfit5, name: "Classic Trench", price: "$3,200", rating: 5, description: "The quintessential trench coat reimagined with luxurious detailing. Water-resistant gabardine with hand-stitched seams and signature belt closure.", fabric: "Cotton Gabardine", style: "Outerwear", category: "Unisex" },
  { id: "sequin-evening-dress", image: outfit6, name: "Sequin Evening Dress", price: "$6,100", rating: 5, description: "Thousands of hand-sewn micro-sequins create a mesmerizing shimmer. This body-conscious silhouette celebrates the art of evening glamour.", fabric: "Sequined Tulle", style: "Evening Dress", category: "Women" },
];
