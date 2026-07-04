import { AlertTriangle, MapPin, Activity, Clock } from 'lucide-react';
import { usePotholes } from '../context/PotholeContext';

export default function Analytics() {
  const { potholes } = usePotholes();
  
  // Computations
  const latestDetection = potholes.length > 0 ? potholes[0] : null;
  const rectifiedPotholes = potholes.filter(p => p.status === 'Rectified');
  const lastRectified = rectifiedPotholes.length > 0 ? rectifiedPotholes[0] : null;
  const pendingCount = potholes.filter(p => p.status === 'Pending').length;
  
  // Most dangerous road computation
  const roadCounts = {};
  potholes.forEach(p => {
    if (p.status === 'Pending' || p.status === 'In Progress') {
      roadCounts[p.roadName] = (roadCounts[p.roadName] || 0) + 1;
    }
  });
  const mostDangerousRoad = Object.keys(roadCounts).sort((a,b) => roadCounts[b] - roadCounts[a])[0];
  const mostDangerousCount = mostDangerousRoad ? roadCounts[mostDangerousRoad] : 0;

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Latest Detection Card */}
        <div className="card md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-danger" />
            <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">Latest Detection</h3>
          </div>
          {latestDetection ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Road</span>
                <span className="font-medium text-right">{latestDetection.roadName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Location</span>
                <span className="font-medium text-xs text-right">{latestDetection.lat.toFixed(4)}, {latestDetection.lng.toFixed(4)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Time</span>
                <span className="font-medium text-right">{latestDetection.detectionDate} {latestDetection.detectionTime}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Severity</span>
                <span className="font-bold">{latestDetection.severity}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Status</span>
                <span className="font-bold text-red-500">{latestDetection.status}</span>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-sm">No potholes detected yet. Run Live Map vehicle.</div>
          )}
        </div>

        {/* Most Dangerous Road Card */}
        <div className="card md:col-span-1 flex flex-col justify-center items-center text-center">
          <div className="flex items-center gap-2 mb-4 absolute top-6 left-6">
            <MapPin className="w-5 h-5 text-primary-500" />
            <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">Most Dangerous Road</h3>
          </div>
          {mostDangerousRoad ? (
            <>
              <h2 className="text-xl font-bold mt-8 mb-2 break-words max-w-full px-2">{mostDangerousRoad}</h2>
              <p className="text-danger font-medium">{mostDangerousCount} pending potholes</p>
            </>
          ) : (
            <div className="text-slate-400 text-sm mt-8">N/A</div>
          )}
        </div>

        {/* Pending Actions Card */}
        <div className="card md:col-span-1 flex flex-col justify-center items-center text-center">
          <div className="flex items-center gap-2 mb-4 absolute top-6 left-6">
            <Activity className="w-5 h-5 text-warning" />
            <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">Pending Actions</h3>
          </div>
          <h2 className="text-5xl font-bold mt-8 mb-2 text-warning">{pendingCount}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Repairs Pending</p>
        </div>

        {/* Last Rectified Card */}
        <div className="card md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-success" />
            <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">Last Rectified</h3>
          </div>
          {lastRectified ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Road</span>
                <span className="font-medium text-right">{lastRectified.roadName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Time</span>
                <span className="font-medium text-right">{lastRectified.repairDate} {lastRectified.repairTime}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Officer</span>
                <span className="font-bold text-green-500">{lastRectified.officerName}</span>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-sm">No rectified potholes yet.</div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recently Detected Potholes Table */}
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-md">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">Recently Detected (Latest 10)</h3>
          </div>
          
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 dark:border-dark-border text-slate-500 sticky top-0 bg-white dark:bg-dark-card z-10">
                <tr>
                  <th className="pb-3 font-medium">Road</th>
                  <th className="pb-3 font-medium">Date & Time</th>
                  <th className="pb-3 font-medium">Severity</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {potholes.slice(0, 10).map((record) => (
                  <tr key={record.id}>
                    <td className="py-3 font-medium max-w-[150px] truncate" title={record.roadName}>{record.roadName}</td>
                    <td className="py-3 text-slate-500 text-xs">{record.detectionDate} {record.detectionTime}</td>
                    <td className="py-3">
                      <span className={`font-medium ${
                        record.severity === 'High' ? 'text-red-500' : record.severity === 'Medium' ? 'text-orange-500' : 'text-green-500'
                      }`}>{record.severity}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        record.status === 'Rectified' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        record.status === 'In Progress' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-red-50 text-red-500 border border-red-100 dark:border-red-900/50 dark:bg-transparent'
                      }`}>{record.status}</span>
                    </td>
                  </tr>
                ))}
                {potholes.length === 0 && (
                  <tr><td colSpan="4" className="py-4 text-center text-slate-400">No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-success/10 text-success rounded-md">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg">Recent Activity</h3>
          </div>
          
          <div className="space-y-6 relative max-h-[300px] overflow-y-auto before:absolute before:inset-0 before:ml-2 before:w-0.5 before:bg-slate-200 dark:before:bg-dark-border pl-8">
            {potholes.slice(0, 15).map((record) => (
              <div key={record.id} className="relative mb-6 last:mb-0">
                <div className={`absolute -left-10 w-4 h-4 rounded-full border-2 bg-white dark:bg-dark-card mt-1 z-10 ${
                  record.status === 'Rectified' ? 'border-green-500' : record.status === 'In Progress' ? 'border-orange-500' : 'border-red-500'
                }`}></div>
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-slate-400 font-medium">{record.status === 'Rectified' ? record.repairTime : record.detectionTime}</span>
                  </div>
                  {record.status === 'Rectified' ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Marked <span className="font-semibold text-green-500">Rectified</span> on <span className="font-semibold">{record.roadName}</span> by Officer {record.officerName}.
                    </p>
                  ) : record.status === 'In Progress' ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Repair <span className="font-semibold text-orange-500">Started</span> on <span className="font-semibold">{record.roadName}</span>.
                    </p>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Pothole <span className="font-semibold text-red-500">Detected</span> on <span className="font-semibold">{record.roadName}</span>.
                    </p>
                  )}
                </div>
              </div>
            ))}
            {potholes.length === 0 && <div className="text-slate-400 text-sm">No activity recorded.</div>}
          </div>
        </div>

      </div>
    </div>
  );
}

// Needed for Lucide icon CheckCircle inside the file
import { CheckCircle } from 'lucide-react';
