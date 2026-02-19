import { useRef, useEffect, useState, useCallback } from "react";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { MapPin, Loader2 } from "lucide-react";

const libraries: ("places")[] = ["places"];

export interface DeliveryLocation {
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  googleMapsLink: string;
}

interface AddressAutocompleteProps {
  onSelect: (location: DeliveryLocation) => void;
  value?: string;
  error?: string;
  placeholder?: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const AddressAutocomplete = ({
  onSelect,
  value = "",
  error,
  placeholder = "Search for delivery address...",
}: AddressAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [isSelected, setIsSelected] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();

      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name || "";

        const location: DeliveryLocation = {
          deliveryAddress: address,
          deliveryLat: lat,
          deliveryLng: lng,
          googleMapsLink: `https://www.google.com/maps?q=${lat},${lng}`,
        };

        setInputValue(address);
        setIsSelected(true);
        onSelect(location);
      }
    }
  }, [onSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsSelected(false);
  };

  if (loadError) {
    return (
      <div className="space-y-2">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              // Fallback: allow manual entry if Google Maps fails
              onSelect({
                deliveryAddress: e.target.value,
                deliveryLat: 0,
                deliveryLng: 0,
                googleMapsLink: "",
              });
            }}
            placeholder="Enter delivery address manually"
            className="w-full pl-10 pr-4 py-3 bg-secondary/10 border border-border focus:border-foreground focus:outline-none transition-colors font-body text-sm text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
        <p className="font-body text-[10px] text-muted-foreground/60">
          Google Maps unavailable — enter address manually
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 py-3 px-4 bg-secondary/10 border border-border">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="font-body text-sm text-muted-foreground">Loading address search...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <MapPin
          className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
            isSelected ? "text-foreground" : "text-muted-foreground"
          }`}
        />
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            types: ["geocode", "establishment"],
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`w-full pl-10 pr-4 py-3 bg-secondary/10 border transition-colors font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none ${
              error
                ? "border-destructive focus:border-destructive"
                : isSelected
                ? "border-foreground/40 focus:border-foreground"
                : "border-border focus:border-foreground"
            }`}
          />
        </Autocomplete>
      </div>

      {isSelected && (
        <p className="font-body text-[10px] text-muted-foreground/60 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          Address verified via Google Maps
        </p>
      )}

      {error && (
        <p className="font-body text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};

export default AddressAutocomplete;
