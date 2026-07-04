import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PotholeProvider } from './context/PotholeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import LiveMap from './pages/LiveMap';
import Analysis from './pages/Analysis';
import Report from './pages/Report';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PotholeProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route element={<Layout />}>
                <Route path="/map" element={<LiveMap />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/report" element={<Report />} />
              </Route>
            </Routes>
          </Router>
          <ToastContainer position="bottom-right" theme="colored" />
        </PotholeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
