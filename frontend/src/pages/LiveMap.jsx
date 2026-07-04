import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation2, MapPin, Activity, ShieldAlert, CheckCircle2, Clock, Crosshair, Search, PenTool, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { usePotholes } from '../context/PotholeContext';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const getStatusIcon = (status) => {
  if (status === 'Pending') return createIcon('red');
  if (status === 'In Progress') return createIcon('orange');
  if (status === 'Rectified') return createIcon('green');
  return createIcon('red');
};

function MapController({ bounds, myLocation, potholes }) {
  const map = useMap();
  useEffect(() => { 
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] }); 
    } else if (myLocation) {
      map.flyTo(myLocation, 15, { animate: true, duration: 1.5 });
    } else if (potholes && potholes.length > 0) {
      // Automatically center map to fit all received API potholes
      const potholeBounds = L.latLngBounds(potholes.map(p => [p.lat, p.lng]));
      map.fitBounds(potholeBounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [bounds, myLocation, map, potholes]);
  return null;
}

export default function LiveMap() {
  const { potholes, addPothole, updatePotholeStatus } = usePotholes();
  
  // App States
  const [journeyState, setJourneyState] = useState('setup'); // setup, fetching, completed
  const [isAdmin, setIsAdmin] = useState(true); // Mock auth toggle
  
  // Search States
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [myLocationCoords, setMyLocationCoords] = useState(null);
  
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  
  // Debounce refs
  const searchTimeout = useRef(null);

  // Route Data
  const [fullRoute, setFullRoute] = useState([]);
  const [routeSegments, setRouteSegments] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);
  
  // Route Summary Stats
  const [routeStats, setRouteStats] = useState({
    distance: 0, duration: 0, health: 100, startName: '', endName: '', mostDangerous: '',
    totalPotholes: 0, pending: 0, inProgress: 0, rectified: 0
  });

  const [editForm, setEditForm] = useState({ status: '', officer: '', date: '', time: '', remarks: '' });

  // Nominatim Autocomplete Search
  const fetchSuggestions = async (query, isStart) => {
    if (query.length < 3) {
      if (isStart) setStartSuggestions([]); else setEndSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=in&limit=5`);
      const data = await res.json();
      if (isStart) setStartSuggestions(data); else setEndSuggestions(data);
    } catch(err) {
      console.error("Geocoding error", err);
    }
  };

  const handleSearchChange = (val, isStart) => {
    if (isStart) setStartQuery(val); else setEndQuery(val);
    
    // Debounce the API call so we don't spam Nominatim while typing
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchSuggestions(val, isStart);
    }, 500);
  };

  const handleSelectLocation = (loc, isStart) => {
    const coords = [parseFloat(loc.lat), parseFloat(loc.lon)];
    if (isStart) {
      setStartCoords(coords);
      setStartQuery(loc.display_name);
      setStartSuggestions([]);
    } else {
      setEndCoords(coords);
      setEndQuery(loc.display_name);
      setEndSuggestions([]);
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.info("Fetching GPS Location...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          setStartCoords(coords);
          setMyLocationCoords(coords);
          
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`);
            const data = await res.json();
            setStartQuery(data.display_name || "Current GPS Location");
          } catch {
            setStartQuery("Current GPS Location");
          }
          toast.success("Location found.");
        },
        () => {
          toast.error("Location permission denied. Please enter your location manually.");
        }
      );
    }
  };

  const generateRoute = async () => {
    if (!startCoords || !endCoords) {
      toast.error("Please select a valid location from the suggestions.");
      return;
    }

    setJourneyState('fetching');
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`);
      const data = await res.json();
      
      if (!data.routes || data.routes.length === 0) {
        toast.error("No driving route found.");
        setJourneyState('setup');
        return;
      }
      
      const routeData = data.routes[0];
      const coords = routeData.geometry.coordinates.map(c => [c[1], c[0]]);
      
      const bounds = L.latLngBounds(coords);
      setMapBounds(bounds);
      setFullRoute(coords);
      setMyLocationCoords(null); // clear individual zoom

      // Simulate fetching potholes from database specifically for this road
      const generatedPotholes = [];
      coords.forEach((c, i) => {
         if (i > 5 && i < coords.length - 5 && Math.random() > 0.95) {
            generatedPotholes.push({
              id: `PH-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              roadName: startQuery.split(',')[0] + " Route Segment",
              lat: c[0], lng: c[1],
              detectionDate: new Date().toLocaleDateString(),
              detectionTime: new Date().toLocaleTimeString(),
              severity: Math.random() > 0.7 ? 'High' : (Math.random() > 0.5 ? 'Medium' : 'Low'),
              confidence: Math.floor(Math.random() * 15 + 85),
              status: Math.random() > 0.8 ? 'In Progress' : (Math.random() > 0.9 ? 'Rectified' : 'Pending'),
              repairDate: '-', repairTime: '-', officerName: '-', remarks: '-'
            });
         }
      });
      
      generatedPotholes.forEach(p => addPothole(p));

      // Segment the route for road coloring
      const segments = [];
      const segmentSize = Math.max(2, Math.floor(coords.length / 20));
      let totalHealthScore = 0;
      let worstSegName = "None";
      let worstSegCount = -1;

      for (let i = 0; i < coords.length - 1; i += (segmentSize - 1)) {
         const pathChunk = coords.slice(i, i + segmentSize);
         if (pathChunk.length > 1) {
             const segPotholes = generatedPotholes.filter(p => {
               const lats = pathChunk.map(c=>c[0]);
               const lngs = pathChunk.map(c=>c[1]);
               return p.lat >= Math.min(...lats)-0.001 && p.lat <= Math.max(...lats)+0.001 &&
                      p.lng >= Math.min(...lngs)-0.001 && p.lng <= Math.max(...lngs)+0.001;
             });
             
             let newColor = '#10b981'; // Green
             if (segPotholes.length >= 1 && segPotholes.length <= 2) newColor = '#eab308'; // Yellow
             else if (segPotholes.length >= 3 && segPotholes.length <= 5) newColor = '#f59e0b'; // Orange
             else if (segPotholes.length > 5) newColor = '#ef4444'; // Red
             
             if (segPotholes.length > worstSegCount) {
               worstSegCount = segPotholes.length;
               worstSegName = segPotholes.length > 0 ? segPotholes[0].roadName : "N/A";
             }

             const severityWeight = segPotholes.reduce((acc, curr) => acc + (curr.severity === 'High' ? 3 : curr.severity === 'Medium' ? 2 : 1), 0);
             const health = Math.max(0, 100 - (severityWeight * 10));
             totalHealthScore += health;

             segments.push({ id: i, path: pathChunk, color: newColor, health });
         }
      }
      setRouteSegments(segments);

      setRouteStats({
        distance: (routeData.distance / 1000).toFixed(1),
        duration: Math.ceil(routeData.duration / 60),
        health: Math.round(totalHealthScore / segments.length),
        startName: startQuery.split(',')[0],
        endName: endQuery.split(',')[0],
        mostDangerous: worstSegName,
        totalPotholes: generatedPotholes.length,
        pending: generatedPotholes.filter(p=>p.status==='Pending').length,
        inProgress: generatedPotholes.filter(p=>p.status==='In Progress').length,
        rectified: generatedPotholes.filter(p=>p.status==='Rectified').length
      });

      setJourneyState('completed');
      toast.success("Route Analyzed Successfully.");
      
    } catch(err) {
      toast.error("Failed to generate route.");
      setJourneyState('setup');
    }
  };

  const handleUpdateStatus = (e, pothole) => {
    e.preventDefault();
    updatePotholeStatus(pothole.id, editForm.status || pothole.status, editForm.officer, editForm.remarks);
    toast.success("Pothole status updated globally.");
    const pStatus = editForm.status || pothole.status;
    setRouteStats(s => ({
       ...s,
       pending: s.pending + (pStatus === 'Pending' ? 1 : 0) - (pothole.status === 'Pending' ? 1 : 0),
       inProgress: s.inProgress + (pStatus === 'In Progress' ? 1 : 0) - (pothole.status === 'In Progress' ? 1 : 0),
       rectified: s.rectified + (pStatus === 'Rectified' ? 1 : 0) - (pothole.status === 'Rectified' ? 1 : 0),
    }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-6rem)] animate-fade-in">
      
      {/* Sidebar Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-4 overflow-y-auto shrink-0 relative">
        
        {/* Toggle Auth View (Demo Utility) */}
        <div className="absolute top-0 right-0 z-10 flex gap-2 text-xs">
           <button onClick={()=>setIsAdmin(false)} className={`px-2 py-1 rounded ${!isAdmin?'bg-primary-500 text-white':'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>User View</button>
           <button onClick={()=>setIsAdmin(true)} className={`px-2 py-1 rounded ${isAdmin?'bg-primary-500 text-white':'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>Authority View</button>
        </div>

        {/* Route Setup */}
        {(journeyState === 'setup' || journeyState === 'fetching') && (
          <div className="card space-y-5 pt-8 overflow-visible">
            <h2 className="text-xl font-bold flex items-center gap-2"><Search className="text-primary-500 w-5 h-5"/> Route Search</h2>
            
            <button onClick={useCurrentLocation} className="btn-secondary w-full py-2 flex justify-center items-center gap-2 text-sm border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
              <Crosshair className="w-4 h-4"/> Use My Current Location
            </button>

            <div className="space-y-4 relative">
              <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
              
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-2 top-3 text-green-500 bg-white dark:bg-dark-card z-10" />
                <input type="text" className="input-field pl-9" placeholder="Enter Start Location..." 
                  value={startQuery} onChange={(e) => handleSearchChange(e.target.value, true)} />
                
                {startSuggestions.length > 0 && (
                  <ul className="absolute top-11 left-0 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-md z-50 max-h-60 overflow-auto">
                    {startSuggestions.map((loc, i) => (
                      <li key={i} onClick={() => handleSelectLocation(loc, true)} className="p-3 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 transition-colors flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0"/> <span className="line-clamp-2">{loc.display_name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-2 top-3 text-red-500 bg-white dark:bg-dark-card z-10" />
                <input type="text" className="input-field pl-9" placeholder="Enter Destination..." 
                  value={endQuery} onChange={(e) => handleSearchChange(e.target.value, false)} />
                
                {endSuggestions.length > 0 && (
                  <ul className="absolute top-11 left-0 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-md z-50 max-h-60 overflow-auto">
                    {endSuggestions.map((loc, i) => (
                      <li key={i} onClick={() => handleSelectLocation(loc, false)} className="p-3 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 transition-colors flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0"/> <span className="line-clamp-2">{loc.display_name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <button onClick={generateRoute} disabled={journeyState === 'fetching'} className="btn-primary w-full py-3 text-lg flex justify-center items-center gap-2">
              {journeyState === 'fetching' ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating Route...</> : "Generate Route & Analyze"}
            </button>
          </div>
        )}

        {/* Route Summary */}
        {journeyState === 'completed' && (
          <div className="card space-y-6 pt-8 relative">
            <button onClick={()=>{setJourneyState('setup'); setFullRoute([]); setRouteSegments([]); setStartQuery(''); setEndQuery(''); setStartCoords(null); setEndCoords(null); setMapBounds(null);}} className="absolute top-3 left-3 text-xs text-primary-500 font-bold underline">← New Search</button>
            <div className="text-center pb-4 border-b border-slate-200 dark:border-dark-border">
              <h2 className="text-xl font-bold">Route Summary</h2>
              <p className="text-slate-500 text-sm mt-1">{routeStats.startName} → {routeStats.endName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                <div className="text-lg font-bold">{routeStats.distance} <span className="text-xs font-normal text-slate-500">km</span></div>
                <div className="text-[10px] uppercase text-slate-500">Distance</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                <div className="text-lg font-bold">{routeStats.duration} <span className="text-xs font-normal text-slate-500">min</span></div>
                <div className="text-[10px] uppercase text-slate-500">Travel Time</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                <div className="text-lg font-bold text-danger">{routeStats.totalPotholes}</div>
                <div className="text-[10px] uppercase text-slate-500">Total Potholes</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                <div className={`text-lg font-bold ${routeStats.health > 80 ? 'text-success' : routeStats.health > 50 ? 'text-warning' : 'text-danger'}`}>{routeStats.health}%</div>
                <div className="text-[10px] uppercase text-slate-500">Road Health</div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div> Pending</span>
                <span className="font-bold">{routeStats.pending}</span>
              </div>
              <div className="flex justify-between items-center p-2 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div> In Progress</span>
                <span className="font-bold">{routeStats.inProgress}</span>
              </div>
              <div className="flex justify-between items-center p-2 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div> Rectified</span>
                <span className="font-bold">{routeStats.rectified}</span>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800">
              <div className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Most Dangerous Segment</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{routeStats.mostDangerous}</div>
            </div>
          </div>
        )}
      </div>

      {/* Map Area */}
      <div className="card flex-1 p-0 overflow-hidden relative">
        <MapContainer center={[0, 0]} zoom={2} className="w-full h-full z-10 relative">
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          
          <MapController bounds={mapBounds} myLocation={myLocationCoords} potholes={potholes} />

          {myLocationCoords && !fullRoute.length && (
            <CircleMarker center={myLocationCoords} radius={8} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8 }}>
              <Popup>My Location</Popup>
            </CircleMarker>
          )}

          {routeSegments.map((segment) => (
            <Polyline key={`seg-${segment.id}`} positions={segment.path} pathOptions={{ color: segment.color, weight: 6, opacity: 1 }} />
          ))}

          <MarkerClusterGroup chunkedLoading maxClusterRadius={30}>
            {potholes.map(pothole => (
              <Marker key={pothole.id} position={[pothole.lat, pothole.lng]} icon={getStatusIcon(pothole.status)}>
                <Popup className="custom-popup min-w-[280px]">
                  <div className="w-full max-h-[300px] overflow-y-auto pr-1">
                    <h3 className="font-bold text-sm mb-1 pb-1 border-b border-slate-200 dark:border-slate-700">{pothole.roadName}</h3>
                    
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mt-2">
                      <p className="flex justify-between"><span>ID:</span> <span className="font-mono text-[10px]">{pothole.id}</span></p>
                      <p className="flex justify-between"><span>GPS:</span> <span>{pothole.lat.toFixed(6)}, {pothole.lng.toFixed(6)}</span></p>
                      <p className="flex justify-between"><span>Detected:</span> <span>{pothole.detectionDate} {pothole.detectionTime}</span></p>
                      <p className="flex justify-between"><span>Severity:</span> <span className="font-bold">{pothole.severity}</span></p>
                      <p className="flex justify-between"><span>Current Status:</span> 
                        <span className={`font-bold px-1.5 py-0.5 rounded ${pothole.status === 'Pending' ? 'bg-red-100 text-red-600' : pothole.status === 'In Progress' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                          {pothole.status}
                        </span>
                      </p>
                      
                      {isAdmin ? (
                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                          <div className="font-bold text-primary-600 dark:text-primary-400 mb-2 flex items-center gap-1"><PenTool className="w-3 h-3"/> Authority Update</div>
                          <form onSubmit={(e) => handleUpdateStatus(e, pothole)} className="space-y-2">
                            <select className="w-full p-1 text-xs border rounded" onChange={e => setEditForm({...editForm, status: e.target.value})} defaultValue={pothole.status}>
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Rectified">Rectified</option>
                            </select>
                            <input type="text" placeholder="Officer Name" className="w-full p-1 text-xs border rounded" onChange={e => setEditForm({...editForm, officer: e.target.value})} defaultValue={pothole.officerName !== '-' ? pothole.officerName : ''} />
                            <input type="text" placeholder="Remarks" className="w-full p-1 text-xs border rounded" onChange={e => setEditForm({...editForm, remarks: e.target.value})} defaultValue={pothole.remarks !== '-' ? pothole.remarks : ''} />
                            <div className="flex items-center gap-2 border border-dashed border-slate-300 p-1.5 rounded bg-white text-slate-500 cursor-pointer justify-center hover:bg-slate-50">
                              <ImageIcon className="w-3 h-3"/> Upload Repair Photo
                            </div>
                            <button type="submit" className="w-full bg-primary-500 text-white p-1 rounded font-bold hover:bg-primary-600 transition-colors">Save Updates</button>
                          </form>
                        </div>
                      ) : (
                        pothole.status !== 'Pending' && (
                          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                            <p className="flex justify-between"><span>Repair Date:</span> <span>{pothole.repairDate}</span></p>
                            <p className="flex justify-between"><span>Repair Time:</span> <span>{pothole.repairTime}</span></p>
                            <p className="flex justify-between"><span>Officer Name:</span> <span>{pothole.officerName}</span></p>
                            <p className="flex flex-col"><span className="mb-0.5">Remarks:</span> <span className="text-slate-500 italic bg-white dark:bg-dark-card p-1 rounded border border-slate-200">{pothole.remarks}</span></p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
          
          {fullRoute.length > 0 && (
            <>
              <CircleMarker center={fullRoute[0]} radius={8} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 1 }}><Popup>Start</Popup></CircleMarker>
              <CircleMarker center={fullRoute[fullRoute.length-1]} radius={8} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 1 }}><Popup>Destination</Popup></CircleMarker>
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
