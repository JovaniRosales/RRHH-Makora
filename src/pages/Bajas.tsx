import { useState, useEffect } from 'react';
import { UserMinus, Plus, X, Save, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Baja, Colaborador } from '../types';
import { getBajas, saveBajas, getColaboradores, saveColaboradores } from '../utils/storage';
import { formatFecha, generarId } from '../utils/helpers';

export default function Bajas() {
  const [bajas, setBajas] = useState<Baja[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filtro, setFiltro] = useState<'todas' | 'programada' | 'no_programada'>('todas');

  useEffect(() => {
    setBajas(getBajas());
    setColaboradores(getColaboradores());
  }, []);

  const filteredBajas = bajas.filter(b => {
    if (filtro === 'todas') return true;
    return b.tipo === filtro;
  });

  function handleSave(baja: Baja) {
    const updated = [...bajas, baja];
    saveBajas(updated);
    setBajas(updated);

    // Update colaborador status
    const cols = getColaboradores();
    const updatedCols = cols.map(c => {
      if (c.id === baja.colaboradorId) {
        return {
          ...c,
          estado: baja.tipo === 'programada' ? 'baja_programada' as const : 'baja' as const,
          fechaBaja: baja.fechaBaja,
        };
      }
      return c;
    });
    saveColaboradores(updatedCols);
    setColaboradores(updatedCols);
    setShowForm(false);
  }

  function handleUpdateStatus(bajaId: string, estado: Baja['estado']) {
    const updated = bajas.map(b => b.id === bajaId ? { ...b, estado } : b);
    saveBajas(updated);
    setBajas(updated);

    if (estado === 'procesada') {
      const baja = bajas.find(b => b.id === bajaId);
      if (baja) {
        const cols = getColaboradores();
        const updatedCols = cols.map(c => {
          if (c.id === baja.colaboradorId) {
            return { ...c, estado: 'baja' as const, fechaBaja: baja.fechaBaja };
          }
          return c;
        });
        saveColaboradores(updatedCols);
        setColaboradores(updatedCols);
      }
    }
  }

  const getColaboradorName = (id: string) => {
    const col = colaboradores.find(c => c.id === id);
    return col ? `${col.nombre} ${col.apellidoPaterno}` : 'Desconocido';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bajas de Colaboradores</h1>
          <p className="text-gray-500 mt-1">Gestión de bajas programadas y no programadas</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
        >
          <UserMinus className="w-5 h-5" />
          Registrar Baja
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['todas', 'programada', 'no_programada'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtro === f ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'todas' ? 'Todas' : f === 'programada' ? 'Programadas' : 'No Programadas'}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid gap-4">
        {filteredBajas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <UserMinus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No hay bajas registradas</p>
          </div>
        ) : (
          filteredBajas.map(baja => (
            <div key={baja.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      baja.tipo === 'programada' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {baja.tipo === 'programada' ? 'Programada' : 'No Programada'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      baja.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                      baja.estado === 'procesada' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {baja.estado === 'pendiente' ? 'Pendiente' : baja.estado === 'procesada' ? 'Procesada' : 'Cancelada'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800">{getColaboradorName(baja.colaboradorId)}</h3>
                  <p className="text-sm text-gray-500 mt-1">{baja.motivo}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Fecha baja: {formatFecha(baja.fechaBaja)}
                    </span>
                    {baja.fechaProgramada && (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Programada desde: {formatFecha(baja.fechaProgramada)}
                      </span>
                    )}
                  </div>
                  {baja.observaciones && (
                    <p className="text-sm text-gray-500 mt-2 italic">"{baja.observaciones}"</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {baja.estado === 'pendiente' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(baja.id, 'procesada')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Procesar
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(baja.id, 'cancelada')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <BajaFormModal
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          colaboradores={colaboradores.filter(c => c.estado === 'activo' || c.estado === 'periodo_prueba' || c.estado === 'baja_programada')}
        />
      )}
    </div>
  );
}

function BajaFormModal({ onClose, onSave, colaboradores }: {
  onClose: () => void;
  onSave: (baja: Baja) => void;
  colaboradores: Colaborador[];
}) {
  const [form, setForm] = useState({
    colaboradorId: '',
    tipo: 'no_programada' as 'programada' | 'no_programada',
    motivo: '',
    fechaBaja: '',
    fechaProgramada: '',
    observaciones: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const baja: Baja = {
      id: generarId(),
      ...form,
      estado: 'pendiente',
      createdAt: new Date().toISOString(),
    };
    onSave(baja);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Registrar Baja</h2>
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            >
              <option value="">Seleccionar colaborador...</option>
              {colaboradores.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} {c.apellidoPaterno} - {c.estado}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Baja *</label>
            <div className="flex gap-3">
              <label className={`flex-1 flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                form.tipo === 'programada' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="tipo"
                  value="programada"
                  checked={form.tipo === 'programada'}
                  onChange={e => setForm(prev => ({ ...prev, tipo: e.target.value as any }))}
                  className="text-orange-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">Programada</p>
                  <p className="text-xs text-gray-500">Despido con fecha establecida</p>
                </div>
              </label>
              <label className={`flex-1 flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                form.tipo === 'no_programada' ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="tipo"
                  value="no_programada"
                  checked={form.tipo === 'no_programada'}
                  onChange={e => setForm(prev => ({ ...prev, tipo: e.target.value as any }))}
                  className="text-red-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">No Programada</p>
                  <p className="text-xs text-gray-500">Baja inmediata</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
            <select
              value={form.motivo}
              onChange={e => setForm(prev => ({ ...prev, motivo: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            >
              <option value="">Seleccionar motivo...</option>
              <option value="renuncia_voluntaria">Renuncia Voluntaria</option>
              <option value="despido_justificado">Despido Justificado</option>
              <option value="despido_injustificado">Despido Injustificado</option>
              <option value="fin_contrato">Fin de Contrato</option>
              <option value="incapacidad_permanente">Incapacidad Permanente</option>
              <option value="defuncion">Defunción</option>
              <option value="jubilacion">Jubilación</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Baja *</label>
              <input
                type="date"
                value={form.fechaBaja}
                onChange={e => setForm(prev => ({ ...prev, fechaBaja: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>
            {form.tipo === 'programada' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Notificación</label>
                <input
                  type="date"
                  value={form.fechaProgramada}
                  onChange={e => setForm(prev => ({ ...prev, fechaProgramada: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={form.observaciones}
              onChange={e => setForm(prev => ({ ...prev, observaciones: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              placeholder="Detalles adicionales sobre la baja..."
            />
          </div>
        </form>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            Cancelar
          </button>
          <button type="submit" onClick={handleSubmit} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Save className="w-4 h-4" />
            Registrar Baja
          </button>
        </div>
      </div>
    </div>
  );
}
