import { useEffect } from "react";
import { useMap } from "react-leaflet";

const ResetView = ({ onComplete }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo([20.5937, 78.9629], 5, {
      animate: true,
      duration: 1.5,
    });

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return null;
};

export default ResetView;
