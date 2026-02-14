import { useEffect, useState } from "react";
import axios from "axios";
import OutfitCard from "./OutfitCard";

interface Outfit {
  _id: string;
  name: string;
  price: string;
  imageUrl: string;
  rating?: number;
  description: string;
  category: string;
}

const CollectionSection = () => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOutfits = async () => {
      try {
        const res = await axios.get("http://localhost:3001/items", {
          params: { page: 1, limit: 20 },
        });

        setOutfits(
          res.data.data.map((item: any, index: number) => ({
            ...item,
            rating: Math.floor(Math.random() * 5) + 1,
            index,
          }))
        );
      } catch (err) {
        console.error(err);
        setError("Failed to fetch items.");
      } finally {
        setLoading(false);
      }
    };

    fetchOutfits();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <p className="text-center text-muted-foreground">Loading outfits...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <p className="text-center text-red-500">{error}</p>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {outfits.map((item, idx) => (
          <OutfitCard
            key={item._id}
            id={item._id}
            image={item.imageUrl}
            name={item.name}
            price={`$${item.price}`}
            initialRating={item.rating || 0}
            index={idx}
          />
        ))}
      </div>
    </section>
  );
};

export default CollectionSection;
