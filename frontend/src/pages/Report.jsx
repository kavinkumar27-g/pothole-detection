import React from 'react';
import { usePotholes } from '../context/PotholeContext';
import { useAuth } from '../context/AuthContext';
import { Download, FileText, CheckCircle, Clock } from 'lucide-react';

export default function Report() {
  const { potholes } = usePotholes();
  const { userRole } = useAuth();

  const totalPotholes = potholes.length;
  const pending = potholes.filter(p => p.status === 'Pending').length;
  const rectified = potholes.filter(p => p.status === 'Rectified').length;
  
  const latestPothole = [...potholes].sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time))[0];
  const latestRepair = [...potholes].filter(p => p.status === 'Rectified').sort((a, b) => new Date(b.repairDate) - new Date(a.repairDate))[0];

  const handleDownload = (type) => {
    alert(`Downloading ${type} report... (Simulation)`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance Report</h1>
          <p className="text-slate-500 dark:text-slate-400">Comprehensive overview of road health and repairs</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleDownload('CSV')}
            className="px-4 py-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button 
            onClick={() => handleDownload('PDF')}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Potholes</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalPotholes}</div>
        </div>
        <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="text-danger text-sm font-medium mb-1 flex items-center gap-1"><Clock className="w-4 h-4"/> Pending</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{pending}</div>
        </div>
        <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="text-success text-sm font-medium mb-1 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Rectified</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{rectified}</div>
        </div>
        <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Avg Repair Time</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">2.5 Days</div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Detailed Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-dark-border">
              <tr>
                <th className="px-6 py-4 font-medium">Road Name</th>
                <th className="px-6 py-4 font-medium">Latest Detection</th>
                <th className="px-6 py-4 font-medium">Status</th>
                {userRole === 'authority' && (
                  <>
                    <th className="px-6 py-4 font-medium">Repair Time</th>
                    <th className="px-6 py-4 font-medium">Repair Officer</th>
                  </>
                )}
                {userRole === 'public' && (
                   <th className="px-6 py-4 font-medium">Latest Repair</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {potholes.map((ph) => (
                <tr key={ph.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{ph.roadName}</td>
                  <td className="px-6 py-4">{ph.date} <span className="text-xs text-slate-400">{ph.time}</span></td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      ph.status === 'Pending' ? 'text-danger bg-danger/10 border-danger/20' :
                      ph.status === 'In Progress' ? 'text-warning bg-warning/10 border-warning/20' :
                      'text-success bg-success/10 border-success/20'
                    }`}>
                      {ph.status}
                    </span>
                  </td>
                  {userRole === 'authority' && (
                    <>
                      <td className="px-6 py-4 text-slate-500">{ph.status === 'Rectified' ? `${ph.repairDate} ${ph.repairTime}` : '-'}</td>
                      <td className="px-6 py-4 text-slate-500">{ph.officerName || '-'}</td>
                    </>
                  )}
                  {userRole === 'public' && (
                     <td className="px-6 py-4 text-slate-500">{ph.status === 'Rectified' ? `${ph.repairDate}` : 'Pending'}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
