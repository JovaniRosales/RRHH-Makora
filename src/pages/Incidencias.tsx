import { useState, useEffect } from 'react';
import { Calendar, Plus, X, Save, Palmtree, Clock, HeartPulse, AlertTriangle, FileCheck } from 'lucide-react';
import { Incidencia, Colaborador, TipoIncidencia } from '../types';
import { getIncidencias, saveIncidencias, getColaboradores, saveColaboradores } from '../utils/storage';
import { formatFecha, generarId, calcularDiasEntre } from '../utils/helpers';

const tipoConfig: Record<TipoIncidencia, { label: string; icon: any; color: string; bgColor: string }> = {
  vacaciones: { label: 'Vacaciones', icon: Palmtree, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  horas_extras: { label: 'Horas Extras', icon: Clock, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  incapacidad: { label: 'Incapacidad', icon: HeartPulse, color: 'text-red-600', bgColor: 'bg-red-100' },
  ausentismo: { label: 'Ausentismo', icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  permiso: { label: 'Permiso', icon: FileCheck, color: 'text-green-600', bgColor: 'bg-green-100' },
};

export default function Incidencias() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<TipoIncidencia | 'todas'>('todas');

  useEffect(() => {
    setIncidencias(getIncidencias());
    setColaboradores(getColaboradores());
  }, []);

  const filteredIncidencias = incidencias.filter(i => {
    if (filtroTipo === 'todas') return true;
    return i.tipo === filtroTipo;
  });

  function handleSave(incidencia: Incidencia) {
    const updated = [...incidencias, incidencia];
    saveIncidencias(updated);
    setIncidencias(updated);

    // Si es vacaciones, actualizar días tomados
    if (incidencia.tipo === 'vacaciones' && incidencia.estado === 'aprobada') {
      const cols = getColaboradores();
      const updatedCols = cols.map(c => {
        if (c.id === incidencia.colaboradorId) {
          return { ...c, diasVacacionesTomados: c.diasVacacionesTomados + incidencia.dias };
        }
        return c;
      });
      saveColaboradores(updatedCols);
      setColaboradores(updatedCols);
    }

    setShowForm(false);
  }

  function handleUpdateStatus(id: string, estado: Incidencia['estado']) {
    const updated = incidencias.map(i => i.id === id ? { ...i, estado } : i);
    saveIncidencias(updated);
    setIncidencias(updated);
  }

  function getColaboradorName(id: string) {
    const col = colaboradores.find(c => c.id === id);
    return col ? `${col.nombre} ${col.apellidoPaterno}` : 'Desconocido';
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Registro de Incidencias</h1>
          <p className="text-gray-500 mt-1">Vacaciones, horas extras, incapacidades y ausentismos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nueva Incidencia
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFiltroTipo('todas')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filtroTipo === 'todas' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Todas
        </button>
        {(Object.keys(tipoConfig) as TipoIncidencia[]).map(tipo => {
          const config = tipoConfig[tipo];
          return (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                filtroTipo === tipo ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <config.icon className="w-4 h-4" />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {(Object.keys(tipoConfig) as TipoIncidencia[]).map(tipo => {
          const config = tipoConfig[tipo];
          const count = incidencias.filter(i => i.tipo === tipo).length;
          return (
            <div key={tipo} className={`${config.bgColor} rounded-lg p-3 text-center`}>
              <config.icon className={`w-5 h-5 ${config.color} mx-auto mb-1`} />
              <p className={`text-xl font-bold ${config.color}`}>{count}</p>
              <p className="text-xs text-gray-600">{config.label}</p>
            </div>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredIncidencias.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No hay incidencias registradas</p>
          </div>
        ) : (
          filteredIncidencias.map(incidencia => {
            const config = tipoConfig[incidencia.tipo];
            return (
              <div key={incidencia.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`${config.bgColor} p-2 rounded-lg`}>
                        <config.icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{getColaboradorName(incidencia.colaboradorId)}</h3>
                        <p className="text-xs text-gray-500">{config.label}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        incidencia.estado === 'aprobada' ? 'bg-green-100 text-green-700' :
                        incidencia.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {incidencia.estado === 'aprobada' ? 'Aprobada' : incidencia.estado === 'pendiente' ? 'Pendiente' : 'Rechazada'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                      <span>📅 {formatFecha(incidencia.fechaInicio)} - {formatFecha(incidencia.fechaFin)}</span>
                      {incidencia.tipo === 'horas_extras' ? (
                        <span>⏱️ {incidencia.horas} horas</span>
                      ) : (
                        <span>📆 {incidencia.dias} día(s)</span>
                      )}
                    </div>
                    {incidencia.motivo && (
                      <p className="text-sm text-gray-500 mt-2">Motivo: {incidencia.motivo}</p>
                    )}
                    {incidencia.observaciones && (
                      <p className="text-sm text-gray-400 mt-1 italic">"{incidencia.observaciones}"</p>
                    )}
                  </div>
                  {incidencia.estado === 'pendiente' && (
                    <div className="flex gap-2 self-start">
                      <button
                        onClick={() => handleUpdateStatus(incidencia.id, 'aprobada')}
                        className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition-colors"
                      >
                        ✓ Aprobar
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(incidencia.id, 'rechazada')}
                        className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100 transition-colors"
                      >
                        ✗ Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <IncidenciaFormModal
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          colaboradores={colaboradores.filter(c => c.estado === 'activo' || c.estado === 'periodo_prueba')}
        />
      )}
    </div>
  );
}

function IncidenciaFormModal({ onClose, onSave, colaboradores }: {
  onClose: () => void;
  onSave: (inc: Incidencia) => void;
  colaboradores: Colaborador[];
}) {
  const [form, setForm] = useState({
    colaboradorId: '',
    tipo: 'vacaciones' as TipoIncidencia,
    fechaInicio: '',
    fechaFin: '',
    dias: 0,
    horas: 0,
    motivo: '',
    observaciones: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    let dias = form.dias;
    if (form.fechaInicio && form.fechaFin && form.tipo !== 'horas_extras') {
      dias = calcularDiasEntre(form.fechaInicio, form.fechaFin);
    }

    const incidencia: Incidencia = {
      id: generarId(),
      colaboradorId: form.colaboradorId,
      tipo: form.tipo,
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      dias,
      horas: form.tipo === 'horas_extras' ? form.horas : undefined,
      motivo: form.motivo,
      estado: 'pendiente',
      observaciones: form.observaciones,
      createdAt: new Date().toISOString(),
    };
    onSave(incidencia);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Nueva Incidencia</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Colaborador *</label>
            <select
              value={form.colaboradorId}
              onChange={e => setForm(prev => ({ ...prev, colaboradorId: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="">Seleccionar colaborador...</option>
              {colaboradores.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} {c.apellidoPaterno}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Incidencia *</label>
            <select
              value={form.tipo}
              onChange={e => setForm(prev => ({ ...prev, tipo: e.target.value as TipoIncidencia }))}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              {Object.entries(tipoConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
              <input
                type="date"
                value={form.fechaInicio}
                onChange={e => setForm(prev => ({ ...prev, fechaInicio: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin *</label>
              <input
                type="date"
                value={form.fechaFin}
                onChange={e => setForm(prev => ({ ...prev, fechaFin: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {form.tipo === 'horas_extras' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas Extras *</label>
              <input
                type="number"
                value={form.horas}
                onChange={e => setForm(prev => ({ ...prev, horas: Number(e.target.value) }))}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Días</label>
              <input
                type="number"
                value={form.dias}
                onChange={e => setForm(prev => ({ ...prev, dias: Number(e.target.value) }))}
                min="1"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Se calcula automáticamente si seleccionas fechas</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <input
              type="text"
              value={form.motivo}
              onChange={e => setForm(prev => ({ ...prev, motivo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              placeholder="Descripción del motivo..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={form.observaciones}
              onChange={e => setForm(prev => ({ ...prev, observaciones: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              placeholder="Notas adicionales..."
            />
          </div>
        </form>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            Cancelar
          </button>
          <button type="submit" onClick={handleSubmit} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Save className="w-4 h-4" />
            Guardar Incidencia
          </button>
        </div>
      </div>
    </div>
  );
}
