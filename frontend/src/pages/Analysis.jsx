import React from 'react';
import { usePotholes } from '../context/PotholeContext';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, MapPin, Calendar, Clock, Activity, ShieldCheck, Camera, FileCheck } from 'lucide-react';

export default function Analysis() {
  const { potholes } = usePotholes();
  const { userRole } = useAuth();

  const latestPothole = potholes.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time))[0];
  const rectifiedPotholes = potholes.filter(p => p.status === 'Rectified').sort((a, b) => new Date(b.repairDate) - new Date(a.repairDate));
  const latestRectified = rectifiedPotholes[0];
  const pendingRepairsCount = potholes.filter(p => p.status === 'Pending').length;

  const roadCounts = potholes.reduce((acc, curr) => {
    acc[curr.roadName] = (acc[curr.roadName] || 0) + 1;
    return acc;
  }, {});
  
  const mostDangerousRoad = Object.entries(roadCounts).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'text-danger bg-danger/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'low': return 'text-success bg-success/10';
      default: return 'text-slate-500 bg-slate-100 dark:bg-slate-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-danger bg-danger/10 border-danger/20';
      case 'In Progress': return 'text-warning bg-warning/10 border-warning/20';
      case 'Rectified': return 'text-success bg-success/10 border-success/20';
      default: return 'text-slate-500 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Latest Pothole Detected */}
        {latestPothole && (
          <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-slate-200 dark:border-dark-border shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Latest Detection</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 dark:border-dark-border pb-2">
                <span className="text-slate-500 dark:text-slate-400">Road</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{latestPothole.roadName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-dark-border pb-2">
                <span className="text-slate-500 dark:text-slate-400">Location</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{latestPothole.lat.toFixed(4)}, {latestPothole.lng.toFixed(4)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-dark-border pb-2">
                <span className="text-slate-500 dark:text-slate-400">Time</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{latestPothole.date} {latestPothole.time}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-dark-border pb-2">
                <span className="text-slate-500 dark:text-slate-400">Severity</span>
                <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${getSeverityColor(latestPothole.severity)}`}>
                  {latestPothole.severity}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 dark:text-slate-400">Status</span>
                <span className={`font-medium px-2 py-0.5 rounded-full text-xs border ${getStatusColor(latestPothole.status)}`}>
                  {latestPothole.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Most Dangerous Road */}
        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Most Dangerous Road</h3>
          </div>
          <div className="flex flex-col items-center justify-center py-6">
            <span className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">{mostDangerousRoad[0]}</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-danger">{mostDangerousRoad[1]}</span>
              <span className="text-slate-500 dark:text-slate-400">total potholes</span>
            </div>
          </div>
        </div>

        {/* Authority / Public Extra Card */}
        {userRole === 'authority' ? (
           <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-slate-200 dark:border-dark-border shadow-sm">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                 <Activity className="w-5 h-5" />
               </div>
               <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Pending Actions</h3>
             </div>
             <div className="flex flex-col items-center justify-center py-6">
                <span className="text-4xl font-bold text-warning mb-2 text-center">{pendingRepairsCount}</span>
                <span className="text-slate-500 dark:text-slate-400">Repairs Pending</span>
             </div>
           </div>
        ) : (
          latestRectified && (
            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-slate-200 dark:border-dark-border shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Latest Repair</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 dark:border-dark-border pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Road</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{latestRectified.roadName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-dark-border pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Repaired On</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{latestRectified.repairDate} {latestRectified.repairTime}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 dark:text-slate-400">Authority Name</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{latestRectified.officerName}</span>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recently Detected Potholes */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-dark-border flex items-center gap-3">
             <Camera className="w-5 h-5 text-primary-500" />
             <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recently Detected Potholes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-dark-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Road</th>
                  <th className="px-6 py-3 font-medium">Date & Time</th>
                  <th className="px-6 py-3 font-medium">Severity</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {potholes.slice(0, 10).map((ph) => (
                  <tr key={ph.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{ph.roadName}</td>
                    <td className="px-6 py-4">{ph.date} <span className="text-xs text-slate-400">{ph.time}</span></td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(ph.severity)}`}>
                        {ph.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ph.status)}`}>
                        {ph.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Rectified Potholes / Recent Activity */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-dark-border flex items-center gap-3">
             <FileCheck className="w-5 h-5 text-success" />
             <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
               {userRole === 'authority' ? 'Recent Activity' : 'Recently Rectified Potholes'}
             </h3>
          </div>
          <div className="overflow-x-auto">
             {userRole === 'authority' ? (
                <div className="p-6 space-y-6">
                   {/* Timeline representation for authority */}
                   <div className="relative border-l-2 border-slate-200 dark:border-dark-border ml-3 space-y-8">
                     {potholes.slice(0, 3).map((ph, i) => (
                       <div key={i} className="relative pl-6">
                         <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-dark-card border-2 border-primary-500"></span>
                         <div className="flex justify-between items-start mb-1">
                           <h4 className="font-semibold text-slate-800 dark:text-slate-200">{ph.roadName}</h4>
                           <span className="text-xs text-slate-500">{ph.date} {ph.time}</span>
                         </div>
                         <p className="text-sm text-slate-600 dark:text-slate-400">
                           Pothole detected with {ph.severity} severity. Status: {ph.status}.
                         </p>
                       </div>
                     ))}
                   </div>
                </div>
             ) : (
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-dark-border">
                    <tr>
                      <th className="px-6 py-3 font-medium">Road</th>
                      <th className="px-6 py-3 font-medium">Rectified Date & Time</th>
                      <th className="px-6 py-3 font-medium">Authority Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                    {rectifiedPotholes.slice(0, 10).map((ph) => (
                      <tr key={ph.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{ph.roadName}</td>
                        <td className="px-6 py-4">{ph.repairDate} <span className="text-xs text-slate-400">{ph.repairTime}</span></td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{ph.officerName || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
