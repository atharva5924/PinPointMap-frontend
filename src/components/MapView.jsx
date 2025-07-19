import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Circle,
} from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import FlyToPin from "./FlyToPin"; 
import axios from "axios";
import L from "leaflet";
import ResetView from "./ResetView";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL(
    "leaflet/dist/images/marker-icon-2x.png",
    import.meta.url
  ),
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url),
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url),
});

// Custom icons
const defaultIcon = new L.Icon({
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url)
    .href,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const selectedIcon = new L.Icon({
  iconUrl: "/images/marker-icon-red.png",
  iconSize: [35, 41],
  iconAnchor: [12, 41],
});

const MapView = ({ pins, setPins, selectedPin }) => {
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India default
  const [newPin, setNewPin] = useState(null);
  const [remarkInput, setRemarkInput] = useState("");
  const newPinPopupRef = useRef(null);
  const [showHighlight, setShowHighlight] = useState(false);
  const [saving, setSaving] = useState(false);
  const [triggerReset, setTriggerReset] = useState(false);

  // Auto open new pin popup
  useEffect(() => {
    if (newPin) {
      setTimeout(() => {
        if (newPinPopupRef.current) {
          newPinPopupRef.current._source.openPopup();
          console.log("✅ Popup opened manually (after delay)");
        }
      }, 0);
    }
  }, [newPin]);

  // Get user's location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
      },
      () => console.warn("Geolocation denied")
    );
  }, []);

  // Track newPin changes
  useEffect(() => {
    console.log("newPin updated to:", newPin);
  }, [newPin]);

  // Fetch pins from backend
  useEffect(() => {
    axios
      .get("https://pinpointmap-backend.onrender.com/api/pins")
      .then((res) => setPins(res.data))
      .catch((err) => console.error("Error fetching pins:", err));
  }, []);

  useEffect(() => {
    if (selectedPin) {
      setShowHighlight(false); 
      const timeout = setTimeout(() => {
        setShowHighlight(true);
      }, 1200); 
      return () => clearTimeout(timeout); 
    }
  }, [selectedPin]);

  // Fetch address from Nominatim
  const fetchAddress = async (lat, lng) => {
    try {
      const res = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: { format: "json", lat, lon: lng },
          headers: {
            "User-Agent": "pin-drop-map/1.0 (your@email.com)",
          },
        }
      );
      return res.data.display_name;
    } catch (err) {
      console.error("Address fetch failed:", err);
      return "Address not found";
    }
  };

  // Save pin to backend
  const handleSavePin = async () => {
    setSaving(true);
    const address = await fetchAddress(newPin.lat, newPin.lng);
    const pinToSave = {
      lat: newPin.lat,
      lng: newPin.lng,
      remark: remarkInput,
      address,
    };
    try {
      const res = await axios.post("https://pinpointmap-backend.onrender.com/api/pins", pinToSave);
      setPins([...pins, res.data]);
      setNewPin(null);
    } catch (err) {
      console.error("Failed to save pin:", err);
    } finally {
      setSaving(false);
    }
  };

  // Handle map click
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        console.log("Map clicked at:", e.latlng);
        setNewPin({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
        setRemarkInput("");
      },
    });
    return null;
  };


  return (
    <>
    
      <div className="h-screen w-full">
        <MapContainer
          center={mapCenter}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Map click functionality */}
          <MapClickHandler />
          {/* Automatically fly to selected pin */}
          {selectedPin && <FlyToPin pin={selectedPin} />} {/* ✅ New */}
          {/* Render saved pins */}
          {pins.map((pin) => (
            <Marker
              key={pin._id}
              position={[pin.lat, pin.lng]}
              icon={
                selectedPin && selectedPin._id === pin._id
                  ? selectedIcon
                  : defaultIcon
              }
            >
              <Popup>
                <p>
                  <strong>Remark:</strong> {pin.remark || "No remark"}
                </p>
                <p>
                  <strong>Address:</strong> {pin.address || "N/A"}
                </p>
              </Popup>
            </Marker>
          ))}
          {selectedPin && showHighlight && (
            <Circle
              center={[selectedPin.lat, selectedPin.lng]}
              radius={700} // Highlight radius
              pathOptions={{ color: "red", fillOpacity: 0.2 }}
            />
          )}
          {/* 🧭 Reset Button - only shows when a pin is selected */}
          {selectedPin && (
            <button
              onClick={() => setTriggerReset(true)}
              className="fixed bottom-5 right-5 bg-gray-800 text-white px-4 py-2 rounded shadow-lg hover:bg-gray-700 z-[1000]"
            >
              🧭 Reset View
            </button>
          )}
          {/* 🔁 Only render ResetView when triggered */}
          {triggerReset && (
            <ResetView onComplete={() => setTriggerReset(false)} />
          )}
          {/* Render popup for new pin */}
          {newPin && (
            <Marker position={[newPin.lat, newPin.lng]}>
              <Popup ref={newPinPopupRef}>
                {console.log("🔵 Popup rendered for new pin")}
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Enter remark"
                    className="border px-2 py-1 w-25 rounded "
                    value={remarkInput}
                    onChange={(e) => setRemarkInput(e.target.value)}
                  />
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => {
                      console.log("🟢 Save button clicked");
                      handleSavePin();
                    }}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Pin"}
                  </button>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </>
  );
};

export default MapView;
