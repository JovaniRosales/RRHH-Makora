import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Altas from './pages/Altas';
import Bajas from './pages/Bajas';
import Incidencias from './pages/Incidencias';
import Consultas from './pages/Consultas';
import Configuracion from './pages/Configuracion';
import { initializeData } from './utils/storage';

export type Page = 'dashboard' | 'altas' | 'bajas' | 'incidencias' | 'consultas' | 'configuracion';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    initializeData();
  }, []);

  function renderPage() {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'altas': return <Altas />;
      case 'bajas': return <Bajas />;
      case 'incidencias': return <Incidencias />;
      case 'consultas': return <Consultas />;
      case 'configuracion': return <Configuracion />;
      default: return <Dashboard />;
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
