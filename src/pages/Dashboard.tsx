import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';
import { getColaboradores, getBajas, getIncidencias } from '../utils/storage';
import { Colaborador } from '../types';
import { getEstadoPeriodoPrueba, formatFecha } from '../utils/helpers';

export default function Dashboard() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    periodoPrueba: 0,
    bajasProgramadas: 0,
    incidenciasMes: 0,
    porVencer: 0,
  });

  useEffect(() => {
    const cols = getColaboradores();
    const bajas = getBajas();
    const incidencias = getIncidencias();
    
    setColaboradores(cols);
    
    const activos = cols.filter(c => c.estado === 'activo' || c.estado === 'periodo_prueba');
    const enPrueba = cols.filter(c => c.estado === 'periodo_prueba');
    const porVencer = cols.filter(c => 
      c.estado === 'periodo_prueba' && getEstadoPeriodoPrueba(c.fechaFinPeriodoPrueba) === 'por_vencer'
    );
    const bajasProg = bajas.filter(b => b.tipo === 'programada' && b.estado === 'pendiente');
    const mesActual = new Date().getMonth();
    const incidenciasMes = incidencias.filter(i => {
      const fecha = new Date(i.fechaInicio);
      return fecha.getMonth() === mesActual;
    });

    setStats({
      total: cols.length,
      activos: activos.length,
      periodoPrueba: enPrueba.length,
      bajasProgramadas: bajasProg.length,
      incidenciasMes: incidenciasMes.length,
      porVencer: porVencer.length,
    });
  }, []);

  const statCards = [
    { label: 'Total Colaboradores', value: stats.total, icon: Users, color: 'bg-blue-500', bgLight: 'bg-blue-50' },
    { label: 'Activos', value: stats.activos, icon: UserCheck, color: 'bg-green-500', bgLight: 'bg-green-50' },
    { label: 'En Periodo de Prueba', value: stats.periodoPrueba, icon: TrendingUp, color: 'bg-yellow-500', bgLight: 'bg-yellow-50' },
    { label: 'Bajas Programadas', value: stats.bajasProgramadas, icon: UserX, color: 'bg-red-500', bgLight: 'bg-red-50' },
    { label: 'Incidencias del Mes', value: stats.incidenciasMes, icon: Calendar, color: 'bg-purple-500', bgLight: 'bg-purple-50' },
    { label: 'Prueba por Vencer', value: stats.porVencer, icon: AlertTriangle, color: 'bg-orange-500', bgLight: 'bg-orange-50' },
  ];

  const recientes = colaboradores.slice(-5).reverse();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen general del departamento de Recursos Humanos</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div className={`${card.bgLight} p-3 rounded-lg`}>
                <card.icon className={`w-6 h-6 text-gray-700`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Últimos Colaboradores Registrados</h3>
          {recientes.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No hay colaboradores registrados aún</p>
          ) : (
            <div className="space-y-3">
              {recientes.map(col => (
                <div key={col.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-sm">
                      {col.nombre[0]}{col.apellidoPaterno[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{col.nombre} {col.apellidoPaterno}</p>
                    <p className="text-xs text-gray-500">Ingreso: {formatFecha(col.fechaIngreso)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    col.estado === 'activo' ? 'bg-green-100 text-green-700' :
                    col.estado === 'periodo_prueba' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {col.estado === 'periodo_prueba' ? 'Prueba' : col.estado === 'activo' ? 'Activo' : col.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Periodos de Prueba - Resumen</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-600 font-medium">Operativo (30 días)</p>
              <p className="text-2xl font-bold text-blue-800 mt-1">
                {colaboradores.filter(c => c.nivelPuesto === 'operativo' && c.estado === 'periodo_prueba').length}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-sm text-purple-600 font-medium">Administrativo (90 días)</p>
              <p className="text-2xl font-bold text-purple-800 mt-1">
                {colaboradores.filter(c => c.nivelPuesto === 'administrativo' && c.estado === 'periodo_prueba').length}
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-sm text-amber-600 font-medium">Dirección (179 días)</p>
              <p className="text-2xl font-bold text-amber-800 mt-1">
                {colaboradores.filter(c => c.nivelPuesto === 'direccion' && c.estado === 'periodo_prueba').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
