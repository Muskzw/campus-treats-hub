import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

type CampusContextType = {

  campusId: string | null;
  hostelId: string | null;
  roomNumber: string;
  setCampusId: (id: string) => void;
  setHostelId: (id: string) => void;
  setRoomNumber: (room: string) => void;
  isSetup: boolean;
  saveToProfile: () => Promise<void>;
  loading: boolean;
};

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [campusId, setCampusId] = useState<string | null>(null);
  const [hostelId, setHostelId] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [loading, setLoading] = useState(true);

  // Load from profile on login
  useEffect(() => {
    if (!user) {
      setCampusId(null);
      setHostelId(null);
      setRoomNumber("");
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("campus_id, hostel_id, room_number")
        .eq("user_id", user.id)
        .single();
      
      if (data) {
        setCampusId(data.campus_id);
        setHostelId(data.hostel_id);
        setRoomNumber(data.room_number ?? "");
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const isSetup = !!(campusId && hostelId && roomNumber);

  const saveToProfile = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ campus_id: campusId, hostel_id: hostelId, room_number: roomNumber })
      .eq("user_id", user.id);
  };

  return (
    <CampusContext.Provider value={{ campusId, hostelId, roomNumber, setCampusId, setHostelId, setRoomNumber, isSetup, saveToProfile, loading }}>
      {children}
    </CampusContext.Provider>
  );
};

export const useCampus = () => {
  const ctx = useContext(CampusContext);
  if (!ctx) throw new Error("useCampus must be inside CampusProvider");
  return ctx;
};
