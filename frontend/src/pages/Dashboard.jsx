import { useState } from 'react';
import { 
  AlertTriangle, 
  Map as MapIcon, 
  Car, 
  Activity,
  Search,
  Download,
  Filter
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend
);

const topCards = [
  { title: 'Total Potholes', value: '12,450', icon: AlertTriangle, color: 'text-primary-500', bg: 'bg-primary-100 dark:bg-primary-900/30' },
  { title: 'Green Zones', value: '420', icon: MapIcon, color: 'text-success', bg: 'bg-green-100 dark:bg-green-900/30' },
  { title: 'Orange Zones', value: '156', icon: MapIcon, color: 'text-warning', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { title: 'Red Zones', value: '35', icon: MapIcon, color: 'text-danger', bg: 'bg-red-100 dark:bg-red-900/30' },
  { title: 'Vehicles Connected', value: '84', icon: Car, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  { title: 'Avg Road Health', value: '78%', icon: Activity, color: 'text-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/30' },
];

const tableData = [
  { id: 'PH-101', lat: 11.3456, lng: 77.7256, road: 'Main Road', area: 'Salem', severity: 'High', confidence: 98.4, date: '2026-07-02', time: '10:30', status: 'Pending' },
  { id: 'PH-102', lat: 11.3521, lng: 77.7123, road: 'Cross Cut Road', area: 'Salem', severity: 'Medium', confidence: 85.2, date: '2026-07-02', time: '11:15', status: 'Repaired' },
  { id: 'PH-103', lat: 11.3610, lng: 77.7011, road: 'Ring Road', area: 'Salem', severity: 'Low', confidence: 92.1, date: '2026-07-02', time: '12:45', status: 'In Progress' },
  { id: 'PH-104', lat: 11.3322, lng: 77.7455, road: 'Bypass', area: 'Salem', severity: 'High', confidence: 99.1, date: '2026-07-01', time: '09:20', status: 'Pending' },
  { id: 'PH-105', lat: 11.3410, lng: 77.7310, road: 'Market St', area: 'Salem', severity: 'Medium', confidence: 88.5, date: '2026-07-01', time: '14:10', status: 'Pending' },
];

export default function Dashboard() {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: isDarkMode ? '#cbd5e1' : '#475569' } }
    },
    scales: {
      x: { grid: { color: isDarkMode ? '#334155' : '#e2e8f0' }, ticks: { color: isDarkMode ? '#cbd5e1' : '#475569' } },
      y: { grid: { color: isDarkMode ? '#334155' : '#e2e8f0' }, ticks: { color: isDarkMode ? '#cbd5e1' : '#475569' } }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: isDarkMode ? '#cbd5e1' : '#475569' } }
    }
  };

  const trendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Pothole Detections',
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      }
    ]
  };

  const severityData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        label: 'Severity',
        data: [300, 150, 50],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      }
    ]
  };

  const zoneData = {
    labels: ['Green Zone', 'Orange Zone', 'Red Zone'],
    datasets: [
      {
        data: [420, 156, 35],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Overview of road conditions and detections.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {topCards.map((card, idx) => (
          <div key={idx} className="card p-4 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{card.title}</p>
              <h3 className="text-xl font-bold">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2 h-[350px]">
          <h3 className="text-lg font-bold mb-4">Weekly Detections Trend</h3>
          <div className="h-[280px]">
            <Line data={trendData} options={chartOptions} />
          </div>
        </div>
        
        <div className="card h-[350px]">
          <h3 className="text-lg font-bold mb-4">Zone Distribution</h3>
          <div className="h-[280px]">
            <Doughnut data={zoneData} options={pieOptions} />
          </div>
        </div>

        <div className="card lg:col-span-3 h-[350px]">
          <h3 className="text-lg font-bold mb-4">Severity by Area (Monthly)</h3>
          <div className="h-[280px]">
            <Bar 
              data={{
                labels: ['North', 'South', 'East', 'West', 'Central'],
                datasets: [
                  { label: 'Low', data: [120, 90, 150, 80, 200], backgroundColor: '#10b981' },
                  { label: 'Medium', data: [40, 60, 50, 30, 90], backgroundColor: '#f59e0b' },
                  { label: 'High', data: [10, 20, 5, 15, 40], backgroundColor: '#ef4444' }
                ]
              }} 
              options={{...chartOptions, scales: { ...chartOptions.scales, x: { stacked: true }, y: { stacked: true } }}} 
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-bold">Recent Detections</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search ID, Road..." 
                className="input-field pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-secondary p-2"><Filter className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">ID</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Road Name</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3 rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
              {tableData.filter(row => row.road.toLowerCase().includes(searchTerm.toLowerCase()) || row.id.toLowerCase().includes(searchTerm.toLowerCase())).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{row.id}</td>
                  <td className="px-4 py-3">{row.lat}, {row.lng}</td>
                  <td className="px-4 py-3">{row.road}, {row.area}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.severity === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      row.severity === 'Medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {row.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">{row.confidence}%</td>
                  <td className="px-4 py-3">{row.date} {row.time}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.status === 'Repaired' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      row.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
