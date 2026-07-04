import { useState, useMemo } from 'react';
import { Download, FileText, Clock, CheckCircle, Search, Filter, Navigation, MapPin } from 'lucide-react';
import { usePotholes } from '../context/PotholeContext';
import { toast } from 'react-toastify';

export default function Reports() {
  const { potholes } = usePotholes();
  const [filter, setFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const total = potholes.length;
  const pending = potholes.filter(p => p.status === 'Pending').length;
  const inProgress = potholes.filter(p => p.status === 'In Progress').length;
  const rectified = potholes.filter(p => p.status === 'Rectified').length;
  
  // Computations
  const latestDetection = potholes.length > 0 ? potholes[0] : null;
  const rectifiedPotholes = potholes.filter(p => p.status === 'Rectified');
  const latestRepair = rectifiedPotholes.length > 0 ? rectifiedPotholes[0] : null;
  const severityWeight = potholes.reduce((acc, curr) => acc + (curr.severity === 'High' ? 3 : curr.severity === 'Medium' ? 2 : 1), 0);
  const avgHealth = potholes.length > 0 ? Math.max(0, 100 - (severityWeight * 10 / (Math.max(1, Math.floor(potholes.length / 5))))) : 100;

  const filteredRecords = useMemo(() => {
    return potholes.filter(p => {
      let matchesDate = true;
      let matchesStatus = true;
      if (statusFilter !== 'All') matchesStatus = p.status === statusFilter;
      if (filter === 'Today') matchesDate = p.detectionDate === new Date().toLocaleDateString();
      return matchesDate && matchesStatus;
    });
  }, [potholes, filter, statusFilter]);

  const handleExport = (format) => {
    toast.success(`Exporting ${filteredRecords.length} records for current route to ${format}...`);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Route Analysis Report</h1>
          <p className="text-slate-400">Detailed safety and maintenance report for the searched route.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleExport('CSV')} className="flex items-center gap-2 px-4 py-2 bg-transparent border border-slate-600 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors text-sm font-medium">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => handleExport('PDF')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-blue-500/20">
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Global Route Metrics */}
      <div className="bg-[#1e2336] border border-[#2a3149] rounded-xl p-6">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1 md:col-span-2 space-y-4">
               <h3 className="text-white font-bold mb-4 pb-2 border-b border-[#2a3149]">Route Information</h3>
               <div className="flex items-center gap-3"><Navigation className="w-4 h-4 text-green-500"/><span className="text-slate-400">Start:</span> <span className="font-semibold text-white">Active Searched Start Location</span></div>
               <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-red-500"/><span className="text-slate-400">End:</span> <span className="font-semibold text-white">Active Searched Destination</span></div>
               <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-blue-500"/><span className="text-slate-400">Total Potholes:</span> <span className="font-semibold text-white">{total}</span></div>
               <div className="flex items-center gap-3"><Activity className="w-4 h-4 text-purple-500"/><span className="text-slate-400">Route Health:</span> <span className={`font-semibold ${avgHealth > 80 ? 'text-emerald-400' : avgHealth > 50 ? 'text-amber-400' : 'text-red-400'}`}>{Math.round(avgHealth)}%</span></div>
            </div>
            
            <div className="col-span-1 md:col-span-2 space-y-4">
               <h3 className="text-white font-bold mb-4 pb-2 border-b border-[#2a3149]">Maintenance Status</h3>
               <div className="flex justify-between items-center bg-[#171a2b] p-2 rounded">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div> Pending</span>
                  <span className="font-bold text-white">{pending}</span>
               </div>
               <div className="flex justify-between items-center bg-[#171a2b] p-2 rounded">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div> In Progress</span>
                  <span className="font-bold text-white">{inProgress}</span>
               </div>
               <div className="flex justify-between items-center bg-[#171a2b] p-2 rounded">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div> Rectified</span>
                  <span className="font-bold text-white">{rectified}</span>
               </div>
               <div className="mt-2 text-xs text-slate-500 space-y-1 pt-2">
                  <p>Latest Detection: {latestDetection ? `${latestDetection.detectionDate} ${latestDetection.detectionTime}` : 'N/A'}</p>
                  <p>Latest Repair: {latestRepair ? `${latestRepair.repairDate} ${latestRepair.repairTime}` : 'N/A'}</p>
               </div>
            </div>
         </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-[#1e2336] border border-[#2a3149] rounded-xl">
        <div className="flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-slate-400" /> <span className="font-medium text-slate-300">Filters:</span>
        </div>
        <select 
          className="bg-[#171a2b] border border-[#2a3149] text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
          value={filter} onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All Time</option>
          <option value="Today">Today</option>
        </select>
        <select 
          className="bg-[#171a2b] border border-[#2a3149] text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Rectified">Rectified</option>
        </select>
      </div>

      {/* Detailed Records Table */}
      <div className="bg-[#1e2336] border border-[#2a3149] rounded-xl overflow-hidden mt-6">
        <div className="p-5 border-b border-[#2a3149] flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Detailed Route Database</h3>
          <span className="text-sm text-slate-400">Showing {filteredRecords.length} records</span>
        </div>
        
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#171a2b] border-b border-[#2a3149] text-slate-400 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-4 font-medium">ID</th>
                <th className="px-4 py-4 font-medium">Road Name</th>
                <th className="px-4 py-4 font-medium">GPS Coordinates</th>
                <th className="px-4 py-4 font-medium">Detection Time</th>
                <th className="px-4 py-4 font-medium">Severity</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Repair Time</th>
                <th className="px-4 py-4 font-medium">Officer</th>
                <th className="px-4 py-4 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3149]">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-[#23293f] transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-400">{record.id.split('-').pop()}</td>
                  <td className="px-4 py-3 font-medium text-white max-w-[150px] truncate" title={record.roadName}>{record.roadName}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{record.lat.toFixed(5)}, {record.lng.toFixed(5)}</td>
                  <td className="px-4 py-3 text-slate-400">{record.detectionDate} {record.detectionTime}</td>
                  <td className="px-4 py-3 font-medium text-white">{record.severity}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                      record.status === 'Rectified' ? 'border border-emerald-900/50 text-emerald-400 bg-emerald-400/10' :
                      record.status === 'In Progress' ? 'border border-amber-900/50 text-amber-400 bg-amber-400/10' :
                      'border border-red-900/50 text-red-400 bg-red-400/10'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{record.repairTime}</td>
                  <td className="px-4 py-3 text-slate-400">{record.officerName}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-[150px] truncate" title={record.remarks}>{record.remarks}</td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr><td colSpan="9" className="px-5 py-8 text-center text-slate-500">No matching records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
