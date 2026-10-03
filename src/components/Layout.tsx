import { useState } from 'react';
import { 
  Users, UserPlus, UserMinus, Calendar, Search, Settings, 
  LayoutDashboard, Menu, X, Building2
} from 'lucide-react';
import { Page } from '../App';

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

const navItems: { page: Page; icon: any; label: string }[] = [
  { page: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { page: 'altas', icon: UserPlus, label: 'Altas' },
  { page: 'bajas', icon: UserMinus, label: 'Bajas' },
  { page: 'incidencias', icon: Calendar, label: 'Incidencias' },
  { page: 'consultas', icon: Search, label: 'Consultas' },
  { page: 'configuracion', icon: Settings, label: 'Configuración' },
];

export default function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-indigo-700">
          <Building2 className="w-8 h-8 text-indigo-300" />
          <div>
            <h1 className="text-white font-bold text-lg">RH Manager</h1>
            <p className="text-indigo-300 text-xs">Sistema de Recursos Humanos</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="mt-6 px-3 space-y-1">
          {navItems.map(item => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => { onNavigate(item.page); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/15 text-white shadow-lg' 
                    : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-indigo-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-300" />
              <span className="text-indigo-200 text-xs">Total Colaboradores</span>
            </div>
            <p className="text-white font-bold text-2xl mt-1">--</p>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800">Sistema de Gestión de RH</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">RH</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
