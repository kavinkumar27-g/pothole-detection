import { createContext, useContext, useState, useEffect } from 'react';

const PotholeContext = createContext();

export function PotholeProvider({ children }) {
  // Initialize with an empty array so markers are only displayed from the backend API
  const [potholes, setPotholes] = useState([]);

  // Polling mechanism to fetch live potholes every 3 seconds
  useEffect(() => {
    const fetchLivePotholes = async () => {
      try {
        // Use 127.0.0.1 for localhost to avoid IPv6 resolution issues on Windows
        const host = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
        const response = await fetch(`http://${host}:5000/potholes`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setPotholes((prevPotholes) => {
            const newPotholes = [...prevPotholes];
            let changed = false;
            
            // Add any new potholes that aren't already in the state
            data.data.forEach(livePothole => {
              if (!newPotholes.some(p => p.id === livePothole.id)) {
                newPotholes.push(livePothole);
                changed = true;
              }
            });
            
            return changed ? newPotholes : prevPotholes;
          });
        }
      } catch (error) {
        console.error("Error fetching live potholes:", error);
      }
    };

    const intervalId = setInterval(fetchLivePotholes, 3000);
    fetchLivePotholes(); // initial fetch
    
    return () => clearInterval(intervalId);
  }, []);

  const addPothole = (pothole) => {
    setPotholes((prev) => [pothole, ...prev]);
  };

  const updatePotholeStatus = (id, status, officerName = '', remarks = '') => {
    setPotholes((prev) => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status,
          repairDate: new Date().toLocaleDateString(),
          repairTime: new Date().toLocaleTimeString(),
          officerName: officerName || p.officerName,
          remarks: remarks || p.remarks
        };
      }
      return p;
    }));
  };

  return (
    <PotholeContext.Provider value={{ potholes, addPothole, updatePotholeStatus }}>
      {children}
    </PotholeContext.Provider>
  );
}

export function usePotholes() {
  return useContext(PotholeContext);
}
