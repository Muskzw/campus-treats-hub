import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCampus } from "@/context/CampusContext";
import { campuses, hostels } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Building, DoorOpen, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-delivery.webp";

const CampusSetup = () => {
  const navigate = useNavigate();
  const { setCampusId, setHostelId, setRoomNumber, campusId, hostelId, roomNumber } = useCampus();
  const [step, setStep] = useState(0);
  const [localCampus, setLocalCampus] = useState(campusId ?? "");
  const [localHostel, setLocalHostel] = useState(hostelId ?? "");
  const [localRoom, setLocalRoom] = useState(roomNumber);

  const handleFinish = () => {
    setCampusId(localCampus);
    setHostelId(localHostel);
    setRoomNumber(localRoom);
    navigate("/");
  };

  const campusHostels = localCampus ? hostels[localCampus] ?? [] : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="relative h-56 overflow-hidden bg-primary/10">
        <img src={heroImage} alt="Campus delivery" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="font-display text-2xl font-bold">Welcome to CampusGoodies 🎒</h1>
          <p className="text-sm text-muted-foreground mt-1">Get food, snacks & more delivered to your hostel room</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 p-4">
        <div className="flex gap-2 mb-6">
          {[0, 1, 2].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="campus" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-lg">Select your campus</h2>
              </div>
              <div className="space-y-2">
                {campuses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setLocalCampus(c.id); setLocalHostel(""); setStep(1); }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      localCampus === c.id ? "border-primary bg-accent" : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.city}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="hostel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-lg">Select your hostel</h2>
              </div>
              <div className="space-y-2">
                {campusHostels.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => { setLocalHostel(h.id); setStep(2); }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      localHostel === h.id ? "border-primary bg-accent" : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium text-sm">{h.name}</p>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(0)} className="mt-4 text-sm text-primary font-medium">← Back</button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="room" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-4">
                <DoorOpen className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-lg">Enter your room number</h2>
              </div>
              <input
                type="text"
                value={localRoom}
                onChange={(e) => setLocalRoom(e.target.value)}
                placeholder="e.g. Room 204"
                className="w-full p-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
              <button
                onClick={handleFinish}
                disabled={!localRoom.trim()}
                className="w-full mt-4 py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm disabled:opacity-40 transition-opacity"
              >
                Start Ordering 🚀
              </button>
              <button onClick={() => setStep(1)} className="mt-3 text-sm text-primary font-medium">← Back</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CampusSetup;
