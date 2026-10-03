import { useState, useEffect } from 'react';
import { UserPlus, Upload, X, Save, FileText } from 'lucide-react';
import { Colaborador, Documento, NivelPuesto } from '../types';
import { getColaboradores, saveColaboradores, getPuestos, getAreas, getSubAreas, getRazonesSociales, getBancos } from '../utils/storage';
import { getPeriodoPruebaDias, calcularFechaFinPeriodoPrueba, generarId, formatFecha, calcularDiasVacaciones } from '../utils/helpers';
import { Puesto, Area, SubArea, RazonSocial, Banco } from '../types';

export default function Altas() {
  const [showForm, setShowForm] = useState(false);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [subAreas, setSubAreas] = useState<SubArea[]>([]);
  const [razonesSociales, setRazonesSociales] = useState<RazonSocial[]>([]);
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setColaboradores(getColaboradores());
    setPuestos(getPuestos());
    setAreas(getAreas());
    setSubAreas(getSubAreas());
    setRazonesSociales(getRazonesSociales());
    setBancos(getBancos());
  }

  const filteredCols = colaboradores.filter(c => 
    `${c.nombre} ${c.apellidoPaterno} ${c.apellidoMaterno}`.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Altas de Colaboradores</h1>
          <p className="text-gray-500 mt-1">Registro de nuevos colaboradores y control de periodos de prueba</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <UserPlus className="w-5 h-5" />
          Nuevo Colaborador
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar colaborador..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Colaborador</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Puesto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ingreso</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Fin Prueba</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Docs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCols.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    No hay colaboradores registrados. Haz clic en "Nuevo Colaborador" para comenzar.
                  </td>
                </tr>
              ) : (
                filteredCols.map(col => (
                  <tr key={col.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-xs">{col.nombre[0]}{col.apellidoPaterno[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{col.nombre} {col.apellidoPaterno}</p>
                          <p className="text-xs text-gray-500">{col.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{puestos.find(p => p.id === col.puestoId)?.nombre || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatFecha(col.fechaIngreso)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatFecha(col.fechaFinPeriodoPrueba)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        col.estado === 'activo' ? 'bg-green-100 text-green-700' :
                        col.estado === 'periodo_prueba' ? 'bg-yellow-100 text-yellow-700' :
                        col.estado === 'baja_programada' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {col.estado === 'periodo_prueba' ? 'Periodo Prueba' : 
                         col.estado === 'activo' ? 'Activo' :
                         col.estado === 'baja_programada' ? 'Baja Programada' : 'Baja'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {col.documentos.length}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <FormModal
          onClose={() => setShowForm(false)}
          onSave={(col) => {
            const updated = [...colaboradores, col];
            saveColaboradores(updated);
            setColaboradores(updated);
            setShowForm(false);
          }}
          puestos={puestos}
          areas={areas}
          subAreas={subAreas}
          razonesSociales={razonesSociales}
          bancos={bancos}
        />
      )}
    </div>
  );
}

interface FormModalProps {
  onClose: () => void;
  onSave: (col: Colaborador) => void;
  puestos: Puesto[];
  areas: Area[];
  subAreas: SubArea[];
  razonesSociales: RazonSocial[];
  bancos: Banco[];
}

function FormModal({ onClose, onSave, puestos, areas, subAreas, razonesSociales, bancos }: FormModalProps) {
  const [form, setForm] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    curp: '',
    rfc: '',
    nss: '',
    fechaNacimiento: '',
    fechaIngreso: '',
    email: '',
    telefono: '',
    direccion: '',
    puestoId: '',
    areaId: '',
    subAreaId: '',
    razonSocialId: '',
    bancoId: '',
    clabe: '',
    salarioDiario: 0,
    notas: '',
    contactoEmergencia: '',
    telefonoEmergencia: '',
    estadoCivil: '',
    genero: '',
  });
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [nivelPuesto, setNivelPuesto] = useState<NivelPuesto>('operativo');

  const puestoSelected = puestos.find(p => p.id === form.puestoId);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (name === 'puestoId') {
      const puesto = puestos.find(p => p.id === value);
      if (puesto) setNivelPuesto(puesto.nivel);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    
    const newDocs: Documento[] = Array.from(files).map(file => ({
      id: generarId(),
      nombre: file.name,
      tipo: file.type || 'application/octet-stream',
      fechaCarga: new Date().toISOString(),
      tamaño: `${(file.size / 1024).toFixed(1)} KB`,
    }));
    
    setDocumentos(prev => [...prev, ...newDocs]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const diasPrueba = getPeriodoPruebaDias(nivelPuesto);
    const fechaFinPrueba = calcularFechaFinPeriodoPrueba(form.fechaIngreso, diasPrueba);
    const aniosAntiguedad = 0;
    const diasVacaciones = calcularDiasVacaciones(aniosAntiguedad);

    const colaborador: Colaborador = {
      id: generarId(),
      ...form,
      nivelPuesto,
      periodoPruebaDias: diasPrueba,
      fechaFinPeriodoPrueba: fechaFinPrueba,
      estado: 'periodo_prueba',
      salarioDiario: Number(form.salarioDiario),
      diasVacaciones: diasVacaciones || 12,
      diasVacacionesTomados: 0,
      diasVacacionesDisponibles: diasVacaciones || 12,
      primaVacacional: 25,
      documentos,
    };

    onSave(colaborador);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Nuevo Colaborador</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Datos Personales */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              Datos Personales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} required />
              <InputField label="Apellido Paterno *" name="apellidoPaterno" value={form.apellidoPaterno} onChange={handleChange} required />
              <InputField label="Apellido Materno" name="apellidoMaterno" value={form.apellidoMaterno} onChange={handleChange} />
              <InputField label="CURP" name="curp" value={form.curp} onChange={handleChange} placeholder="XXXX000000HXXXXX00" />
              <InputField label="RFC" name="rfc" value={form.rfc} onChange={handleChange} placeholder="XXXX000000XXX" />
              <InputField label="NSS" name="nss" value={form.nss} onChange={handleChange} />
              <InputField label="Fecha de Nacimiento" name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={handleChange} />
              <SelectField label="Género" name="genero" value={form.genero} onChange={handleChange} options={[
                { value: '', label: 'Seleccionar...' },
                { value: 'M', label: 'Masculino' },
                { value: 'F', label: 'Femenino' },
              ]} />
              <SelectField label="Estado Civil" name="estadoCivil" value={form.estadoCivil} onChange={handleChange} options={[
                { value: '', label: 'Seleccionar...' },
                { value: 'soltero', label: 'Soltero(a)' },
                { value: 'casado', label: 'Casado(a)' },
                { value: 'divorciado', label: 'Divorciado(a)' },
                { value: 'viudo', label: 'Viudo(a)' },
                { value: 'union_libre', label: 'Unión Libre' },
              ]} />
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Email *" name="email" type="email" value={form.email} onChange={handleChange} required />
              <InputField label="Teléfono *" name="telefono" value={form.telefono} onChange={handleChange} required />
              <InputField label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} />
              <InputField label="Contacto de Emergencia" name="contactoEmergencia" value={form.contactoEmergencia} onChange={handleChange} />
              <InputField label="Tel. Emergencia" name="telefonoEmergencia" value={form.telefonoEmergencia} onChange={handleChange} />
            </div>
          </div>

          {/* Datos Laborales */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Datos Laborales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Fecha de Ingreso *" name="fechaIngreso" type="date" value={form.fechaIngreso} onChange={handleChange} required />
              <SelectField label="Puesto *" name="puestoId" value={form.puestoId} onChange={handleChange} required options={[
                { value: '', label: 'Seleccionar puesto...' },
                ...puestos.map(p => ({ value: p.id, label: `${p.nombre} (${p.nivel})` }))
              ]} />
              <SelectField label="Área *" name="areaId" value={form.areaId} onChange={handleChange} required options={[
                { value: '', label: 'Seleccionar área...' },
                ...areas.map(a => ({ value: a.id, label: a.nombre }))
              ]} />
              <SelectField label="Sub Área" name="subAreaId" value={form.subAreaId} onChange={handleChange} options={[
                { value: '', label: 'Seleccionar sub área...' },
                ...subAreas.filter(s => s.areaId === form.areaId).map(s => ({ value: s.id, label: s.nombre }))
              ]} />
              <SelectField label="Razón Social *" name="razonSocialId" value={form.razonSocialId} onChange={handleChange} required options={[
                { value: '', label: 'Seleccionar...' },
                ...razonesSociales.map(r => ({ value: r.id, label: r.nombre }))
              ]} />
              <InputField label="Salario Diario *" name="salarioDiario" type="number" value={form.salarioDiario.toString()} onChange={handleChange} required />
            </div>
            {puestoSelected && (
              <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <p className="text-sm text-indigo-700">
                  <strong>Periodo de prueba:</strong> {getPeriodoPruebaDias(nivelPuesto)} días 
                  ({nivelPuesto === 'operativo' ? 'Operativo' : nivelPuesto === 'administrativo' ? 'Administrativo/Mandos Medios' : 'Dirección'})
                </p>
              </div>
            )}
          </div>

          {/* Datos Bancarios */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Datos Bancarios (Nómina)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="Banco" name="bancoId" value={form.bancoId} onChange={handleChange} options={[
                { value: '', label: 'Seleccionar banco...' },
                ...bancos.map(b => ({ value: b.id, label: b.nombre }))
              ]} />
              <InputField label="CLABE" name="clabe" value={form.clabe} onChange={handleChange} placeholder="18 dígitos" />
            </div>
          </div>

          {/* Documentos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
              Expediente Digital
            </h3>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-2">Arrastra archivos o haz clic para seleccionar</p>
              <label className="cursor-pointer bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
                Seleccionar Archivos
                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
              </label>
              <p className="text-xs text-gray-400 mt-2">Contrato, INE, CURP, RFC, NSS, Comprobante domicilio, etc.</p>
            </div>
            {documentos.length > 0 && (
              <div className="mt-3 space-y-2">
                {documentos.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{doc.nombre}</span>
                      <span className="text-xs text-gray-400">({doc.tamaño})</span>
                    </div>
                    <button type="button" onClick={() => setDocumentos(prev => prev.filter(d => d.id !== doc.id))} className="text-red-400 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Observaciones</label>
            <textarea
              name="notas"
              value={form.notas}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              placeholder="Observaciones adicionales..."
            />
          </div>
        </form>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            Cancelar
          </button>
          <button type="submit" onClick={handleSubmit} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Save className="w-4 h-4" />
            Guardar Colaborador
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, type = 'text', required = false, placeholder = '' }: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, required = false }: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
