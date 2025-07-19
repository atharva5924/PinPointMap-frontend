import { useEffect } from "react";
import { useMap } from "react-leaflet";

const FlyToPin = ({ pin }) => {
  const map = useMap();

  useEffect(() => {
    if (pin) {
      map.flyTo([pin.lat, pin.lng], 15, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [pin]);

  return null;
};

export default FlyToPin;
