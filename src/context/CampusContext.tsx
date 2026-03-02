import React, { createContext, useContext, useState } from "react";

type CampusContextType = {
  campusId: string | null;
  hostelId: string | null;
  roomNumber: string;
  setCampusId: (id: string) => void;
  setHostelId: (id: string) => void;
  setRoomNumber: (room: string) => void;
  isSetup: boolean;
};

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campusId, setCampusId] = useState<string | null>(null);
  const [hostelId, setHostelId] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState("");

  const isSetup = !!(campusId && hostelId && roomNumber);

  return (
    <CampusContext.Provider value={{ campusId, hostelId, roomNumber, setCampusId, setHostelId, setRoomNumber, isSetup }}>
      {children}
    </CampusContext.Provider>
  );
};

export const useCampus = () => {
  const ctx = useContext(CampusContext);
  if (!ctx) throw new Error("useCampus must be inside CampusProvider");
  return ctx;
};
