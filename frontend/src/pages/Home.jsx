import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Map as MapIcon, 
  BarChart3, 
  ShieldAlert, 
  Activity, 
  FileText, 
  MapPin,
  Car
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const features = [
  { name: 'AI-Based Detection', description: 'Advanced computer vision models to identify potholes with high accuracy.', icon: Camera, color: 'bg-blue-500' },
  { name: 'GPS Tracking', description: 'Precise location mapping of road damages for quick maintenance.', icon: MapPin, color: 'bg-green-500' },
  { name: 'Live Interactive Map', description: 'Real-time visualization of pothole severity zones on the map.', icon: MapIcon, color: 'bg-orange-500' },
  { name: 'Safety Zones', description: 'Automatic classification of roads into Green, Orange, and Red zones.', icon: ShieldAlert, color: 'bg-red-500' },
  { name: 'Analytics Dashboard', description: 'Comprehensive charts and metrics for road health monitoring.', icon: BarChart3, color: 'bg-indigo-500' },
  { name: 'Automated Reports', description: 'Generate and export detailed maintenance reports instantly.', icon: FileText, color: 'bg-teal-500' },
];

const stats = [
  { name: 'Potholes Detected', value: '12,400+' },
  { name: 'Roads Monitored', value: '850 km' },
  { name: 'Safe Zones', value: '420' },
  { name: 'Dangerous Zones', value: '35' },
];

export default function Home() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-slate-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-success">SmartRoad AI</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/dashboard" className="btn-primary">Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070')] bg-cover bg-center opacity-10 dark:opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 dark:to-dark-bg"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6"
          >
            Smart Road Pothole Detection & <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-success">Safety Monitoring System</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400 mb-10"
          >
            AI-powered pothole detection with GPS mapping and real-time road safety analysis for proactive infrastructure maintenance.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">View Dashboard</Link>
            <Link to="/map" className="btn-secondary text-lg px-8 py-3">Live Map</Link>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Capabilities</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Everything you need to monitor, analyze, and manage road infrastructure health.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="card group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 ${feature.color} shadow-lg shadow-${feature.color}/30`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary-500 transition-colors">{feature.name}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-primary-600 dark:bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-4"
              >
                <div className="text-4xl font-extrabold mb-2">{stat.value}</div>
                <div className="text-primary-100 font-medium">{stat.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-dark-card border-t border-slate-200 dark:border-dark-border text-center">
        <p className="text-slate-500">&copy; 2026 Smart Road Monitoring System. All rights reserved.</p>
      </footer>
    </div>
  );
}
