// src/contexts/LocationContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface LocationContextType {
  location: string;
  setLocation: (loc: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState(() => localStorage.getItem("userLocation") || "Bangalore");

  useEffect(() => {
    localStorage.setItem("userLocation", location);
  }, [location]);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocationContext must be used within LocationProvider");
  return context;
};
