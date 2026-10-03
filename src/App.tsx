import { HashRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Altas from './pages/Altas';
import Bajas from './pages/Bajas';
import Incidencias from './pages/Incidencias';
import Consultas from './pages/Consultas';
import Configuracion from './pages/Configuracion';
import { initializeData } from './utils/storage';

function App() {
  useEffect(() => {
    initializeData();
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="altas" element={<Altas />} />
          <Route path="bajas" element={<Bajas />} />
          <Route path="incidencias" element={<Incidencias />} />
          <Route path="consultas" element={<Consultas />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
