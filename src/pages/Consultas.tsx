import { useState, useEffect } from 'react';
import { Search, User, FileText, Calendar, DollarSign, AlertTriangle, Briefcase, MapPin, Phone, Mail, Shield, Clock } from 'lucide-react';
import { Colaborador } from '../types';
import { getColaboradores, getPuestos, getAreas, getSubAreas, getIncidencias, getRazonesSociales } from '../utils/storage';
import { formatFecha, calcularAntiguedad, calcularDiasDisponibles, calcularDiasVacaciones, getEstadoPeriodoPrueba, calcularDiasEntre } from '../utils/helpers';
import { Puesto, Area, SubArea, Incidencia, RazonSocial } from '../types';

export default function Consultas() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [subAreas, setSubAreas] = useState<SubArea[]>([]);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [razonesSociales, setRazonesSociales] = useState<RazonSocial[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [selectedCol, setSelectedCol] = useState<Colaborador | null>(null);
  const [tab, setTab] = useState<'general' | 'expediente' | 'vacaciones' | 'incidencias' | 'sensible'>('general');

  useEffect(() => {
    setColaboradores(getColaboradores());
    setPuestos(getPuestos());
    setAreas(getAreas());
    setSubAreas(getSubAreas());
    setIncidencias(getIncidencias());
    setRazonesSociales(getRazonesSociales());
  }, []);

  const results = colaboradores.filter(c => {
    const term = busqueda.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(term) ||
      c.apellidoPaterno.toLowerCase().includes(term) ||
      c.apellidoMaterno.toLowerCase().includes(term) ||
      c.curp.toLowerCase().includes(term) ||
      c.rfc.toLowerCase().includes(term) ||
      c.nss.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  });

  const colIncidencias = selectedCol ? incidencias.filter(i => i.colaboradorId === selectedCol.id) : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Consultas</h1>
        <p className="text-gray-500 mt-1">Buscar colaboradores, ver expedientes y datos sensibles</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, CURP, RFC, NSS, email..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
        />
      </div>

      {!selectedCol ? (
        /* Results List */
        <div className="space-y-2">
          {results.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">
                {busqueda ? 'No se encontraron resultados' : 'Escribe algo para buscar colaboradores'}
              </p>
            </div>
          ) : (
            results.map(col => {
              const anios = calcularAntiguedad(col.fechaIngreso);
              const diasDisp = calcularDiasDisponibles(col.fechaIngreso, col.diasVacacionesTomados);
              return (
                <div
                  key={col.id}
                  onClick={() => setSelectedCol(col)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all cursor-pointer flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 font-bold">{col.nombre[0]}{col.apellidoPaterno[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800">{col.nombre} {col.apellidoPaterno} {col.apellidoMaterno}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {puestos.find(p => p.id === col.puestoId)?.nombre} • {areas.find(a => a.id === col.areaId)?.nombre}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
                    <span>{anios} año(s)</span>
                    <span className="text-green-600 font-medium">{diasDisp} días vac.</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      col.estado === 'activo' ? 'bg-green-100 text-green-700' :
                      col.estado === 'periodo_prueba' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {col.estado === 'periodo_prueba' ? 'Prueba' : col.estado === 'activo' ? 'Activo' : col.estado}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Detail View */
        <div>
          <button
            onClick={() => setSelectedCol(null)}
            className="mb-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
          >
            ← Volver a resultados
          </button>

          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-xl">{selectedCol.nombre[0]}{selectedCol.apellidoPaterno[0]}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedCol.nombre} {selectedCol.apellidoPaterno} {selectedCol.apellidoMaterno}</h2>
                <p className="text-gray-500">{puestos.find(p => p.id === selectedCol.puestoId)?.nombre} • {areas.find(a => a.id === selectedCol.areaId)?.nombre}</p>
              </div>
              <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                selectedCol.estado === 'activo' ? 'bg-green-100 text-green-700' :
                selectedCol.estado === 'periodo_prueba' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {selectedCol.estado === 'periodo_prueba' ? 'Periodo Prueba' : selectedCol.estado === 'activo' ? 'Activo' : selectedCol.estado}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg overflow-x-auto">
            {[
              { id: 'general', label: 'General', icon: User },
              { id: 'expediente', label: 'Expediente', icon: FileText },
              { id: 'vacaciones', label: 'Vacaciones', icon: Calendar },
              { id: 'incidencias', label: 'Incidencias', icon: Clock },
              { id: 'sensible', label: 'Datos Sensibles', icon: Shield },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {tab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard title="Datos Personales" icon={User}>
                <InfoRow label="Nombre completo" value={`${selectedCol.nombre} ${selectedCol.apellidoPaterno} ${selectedCol.apellidoMaterno}`} />
                <InfoRow label="Fecha de nacimiento" value={selectedCol.fechaNacimiento ? formatFecha(selectedCol.fechaNacimiento) : '-'} />
                <InfoRow label="Género" value={selectedCol.genero === 'M' ? 'Masculino' : selectedCol.genero === 'F' ? 'Femenino' : '-'} />
                <InfoRow label="Estado civil" value={selectedCol.estadoCivil || '-'} />
              </InfoCard>
              <InfoCard title="Datos de Contacto" icon={Phone}>
                <InfoRow label="Email" value={selectedCol.email} />
                <InfoRow label="Teléfono" value={selectedCol.telefono} />
                <InfoRow label="Dirección" value={selectedCol.direccion || '-'} />
                <InfoRow label="Contacto emergencia" value={selectedCol.contactoEmergencia || '-'} />
                <InfoRow label="Tel. emergencia" value={selectedCol.telefonoEmergencia || '-'} />
              </InfoCard>
              <InfoCard title="Datos Laborales" icon={Briefcase}>
                <InfoRow label="Fecha de ingreso" value={formatFecha(selectedCol.fechaIngreso)} />
                <InfoRow label="Antigüedad" value={`${calcularAntiguedad(selectedCol.fechaIngreso)} año(s)`} />
                <InfoRow label="Puesto" value={puestos.find(p => p.id === selectedCol.puestoId)?.nombre || '-'} />
                <InfoRow label="Área" value={areas.find(a => a.id === selectedCol.areaId)?.nombre || '-'} />
                <InfoRow label="Sub Área" value={subAreas.find(s => s.id === selectedCol.subAreaId)?.nombre || '-'} />
                <InfoRow label="Razón Social" value={razonesSociales.find(r => r.id === selectedCol.razonSocialId)?.nombre || '-'} />
                <InfoRow label="Nivel" value={selectedCol.nivelPuesto === 'operativo' ? 'Operativo' : selectedCol.nivelPuesto === 'administrativo' ? 'Administrativo' : 'Dirección'} />
              </InfoCard>
              <InfoCard title="Periodo de Prueba" icon={Clock}>
                <InfoRow label="Fecha de ingreso" value={formatFecha(selectedCol.fechaIngreso)} />
                <InfoRow label="Días de prueba" value={`${selectedCol.periodoPruebaDias} días`} />
                <InfoRow label="Fin de periodo" value={formatFecha(selectedCol.fechaFinPeriodoPrueba)} />
                <InfoRow label="Estado" value={
                  getEstadoPeriodoPrueba(selectedCol.fechaFinPeriodoPrueba) === 'vigente' ? '✅ Vigente' :
                  getEstadoPeriodoPrueba(selectedCol.fechaFinPeriodoPrueba) === 'por_vencer' ? '⚠️ Por vencer' : '❌ Vencido'
                } />
              </InfoCard>
            </div>
          )}

          {tab === 'expediente' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Documentos del Expediente
              </h3>
              {selectedCol.documentos.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No hay documentos en el expediente</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCol.documentos.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <FileText className="w-8 h-8 text-indigo-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{doc.nombre}</p>
                        <p className="text-xs text-gray-400">{doc.tamaño} • {formatFecha(doc.fechaCarga.split('T')[0])}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'vacaciones' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Vacaciones - Ley Federal del Trabajo
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
                    <p className="text-sm text-blue-600">Días correspondientes</p>
                    <p className="text-3xl font-bold text-blue-800 mt-1">{calcularDiasVacaciones(calcularAntiguedad(selectedCol.fechaIngreso)) || 12}</p>
                    <p className="text-xs text-blue-500 mt-1">según antigüedad ({calcularAntiguedad(selectedCol.fechaIngreso)} año(s))</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center border border-red-100">
                    <p className="text-sm text-red-600">Días tomados</p>
                    <p className="text-3xl font-bold text-red-800 mt-1">{selectedCol.diasVacacionesTomados}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
                    <p className="text-sm text-green-600">Días disponibles</p>
                    <p className="text-3xl font-bold text-green-800 mt-1">{calcularDiasDisponibles(selectedCol.fechaIngreso, selectedCol.diasVacacionesTomados)}</p>
                  </div>
                </div>

                {/* Tabla de días por antigüedad */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Tabla de vacaciones según LFT (Reforma 2023)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Años</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Días</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(anio => {
                          const dias = calcularDiasVacaciones(anio);
                          const currentAnio = calcularAntiguedad(selectedCol.fechaIngreso);
                          return (
                            <tr key={anio} className={anio === currentAnio ? 'bg-indigo-50' : ''}>
                              <td className="px-3 py-2">{anio} año(s)</td>
                              <td className="px-3 py-2 font-medium">{dias} días</td>
                              <td className="px-3 py-2">
                                {anio < currentAnio ? '✅ Cumplido' : anio === currentAnio ? '🔵 Actual' : '⬜ Pendiente'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Prima Vacacional
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Porcentaje LFT</p>
                    <p className="text-xl font-bold text-gray-800">25%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Salario diario</p>
                    <p className="text-xl font-bold text-gray-800">${selectedCol.salarioDiario.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'incidencias' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial de Incidencias</h3>
              {colIncidencias.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No hay incidencias registradas</p>
              ) : (
                <div className="space-y-3">
                  {colIncidencias.map(inc => (
                    <div key={inc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <p className="font-medium text-gray-700 text-sm capitalize">{inc.tipo.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">{formatFecha(inc.fechaInicio)} - {formatFecha(inc.fechaFin)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inc.estado === 'aprobada' ? 'bg-green-100 text-green-700' :
                          inc.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {inc.estado}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {inc.tipo === 'horas_extras' ? `${inc.horas} hrs` : `${inc.dias} día(s)`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'sensible' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Datos Sensibles - Acceso Restringido</p>
                  <p className="text-xs text-amber-600 mt-1">Esta información es confidencial y debe ser tratada conforme a la Ley Federal de Protección de Datos Personales.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard title="Identificación Oficial" icon={Shield} warning>
                  <InfoRow label="CURP" value={selectedCol.curp || '-'} />
                  <InfoRow label="RFC" value={selectedCol.rfc || '-'} />
                  <InfoRow label="NSS" value={selectedCol.nss || '-'} />
                </InfoCard>
                <InfoCard title="Datos Bancarios" icon={DollarSign} warning>
                  <InfoRow label="Banco" value={selectedCol.bancoId || '-'} />
                  <InfoRow label="CLABE" value={selectedCol.clabe || '-'} />
                  <InfoRow label="Salario diario" value={`$${selectedCol.salarioDiario.toFixed(2)}`} />
                  <InfoRow label="Salario mensual (aprox.)" value={`$${(selectedCol.salarioDiario * 30).toFixed(2)}`} />
                </InfoCard>
                <InfoCard title="Prestaciones" icon={Calendar} warning>
                  <InfoRow label="Días vacaciones (año actual)" value={`${calcularDiasVacaciones(calcularAntiguedad(selectedCol.fechaIngreso)) || 12} días`} />
                  <InfoRow label="Días tomados" value={`${selectedCol.diasVacacionesTomados}`} />
                  <InfoRow label="Días disponibles" value={`${calcularDiasDisponibles(selectedCol.fechaIngreso, selectedCol.diasVacacionesTomados)}`} />
                  <InfoRow label="Prima vacacional" value="25%" />
                </InfoCard>
                <InfoCard title="Notas y Observaciones" icon={FileText}>
                  <p className="text-sm text-gray-600">{selectedCol.notas || 'Sin notas registradas'}</p>
                </InfoCard>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, icon: Icon, children, warning = false }: {
  title: string; icon: any; children: React.ReactNode; warning?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-5 ${warning ? 'border-amber-200' : 'border-gray-100'}`}>
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Icon className={`w-4 h-4 ${warning ? 'text-amber-500' : 'text-indigo-500'}`} />
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}
