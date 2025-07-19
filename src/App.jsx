import { useState, useRef, useEffect } from "react";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import axios from "axios";

function App() {
  const [pins, setPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [zooming, setZooming] = useState(false);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1500);
    const t2 = setTimeout(() => setStage(2), 3500);
    const t3 = setTimeout(() => setStage(3), 5500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleSelectPin = (pin) => {
    setZooming(true);
    setSelectedPin(null);

    setTimeout(() => {
      setSelectedPin(pin);
      setTimeout(() => setZooming(false), 1500);
    }, 50);
  };

  const handleDeletePin = async (id) => {
    await axios.delete(`http://localhost:5000/api/pins/${id}`);
    setPins(pins.filter((pin) => pin._id !== id));
  };

  const handleEditPin = async (pinId, updatedData) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/pins/${pinId}`,
        updatedData
      );
      const updatedPin = res.data;
      setPins((prev) =>
        prev.map((p) => (p._id === updatedPin._id ? updatedPin : p))
      );
      console.log("✅ Pin updated:", updatedPin);
    } catch (error) {
      console.error("❌ Failed to update pin:", error);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden relative font-sans">
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-black z-50 flex items-center justify-center 
          transition-transform duration-[2000ms] ease-in-out 
          ${stage >= 2 ? "-translate-y-full" : "translate-y-0"}`}
      >
        {stage === 0 && (
          <div className="text-white text-2xl animate-pulse">
            🚀 Loading Awesomeness...
          </div>
        )}
        {stage === 1 && (
          <div className="flex flex-col items-center gap-2">
            <div
              className="text-6xl font-extrabold text-transparent bg-clip-text 
                        bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 
                        drop-shadow-[2px_4px_0px_rgba(0,0,0,0.5)] 
                         transition-all duration-500 hover:scale-105 hover:rotate-1 text-center"
            >
              PinPointMap
            </div>
            <div
              className="text-6xl font-extrabold text-transparent bg-clip-text 
                         bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 
                         drop-shadow-[2px_4px_0px_rgba(0,0,0,0.5)] 
                         transition-all duration-500 hover:scale-105 hover:rotate-1 text-center"
            >
              Drop. Discover. Remember.
            </div>
          </div>
        )}
      </div>

      <div className="min-h-screen bg-gradient-to-r from-blue-100 to-green-100 pt-3 relative z-0">
        {stage === 3 && (
          <div className="flex h-[calc(100vh-6rem)]">
            <Sidebar
              pins={pins}
              onSelectPin={handleSelectPin}
              onDeletePin={handleDeletePin}
              onEditPin={handleEditPin}
            />
            <div className="flex-1 relative">
              <MapView
                pins={pins}
                setPins={setPins}
                selectedPin={selectedPin}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
