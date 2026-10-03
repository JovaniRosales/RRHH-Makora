import { useState, useEffect } from 'react';
import { Settings, Building2, Briefcase, FolderTree, Layers, Landmark, Plus, X, Save, Edit2, Trash2, FileText, Shield, Clock } from 'lucide-react';
import { RazonSocial, Puesto, Area, SubArea, Banco, NivelPuesto } from '../types';
import {
  getRazonesSociales, saveRazonesSociales,
  getPuestos, savePuestos,
  getAreas, saveAreas,
  getSubAreas, saveSubAreas,
  getBancos, saveBancos,
} from '../utils/storage';
import { generarId } from '../utils/helpers';

type TabConfig = 'razones' | 'puestos' | 'areas' | 'subareas' | 'bancos';

export default function Configuracion() {
  const [tab, setTab] = useState<TabConfig>('razones');

  const tabs = [
    { id: 'razones' as TabConfig, label: 'Razones Sociales', icon: Building2 },
    { id: 'puestos' as TabConfig, label: 'Puestos', icon: Briefcase },
    { id: 'areas' as TabConfig, label: 'Áreas', icon: FolderTree },
    { id: 'subareas' as TabConfig, label: 'Sub Áreas', icon: Layers },
    { id: 'bancos' as TabConfig, label: 'Bancos', icon: Landmark },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>
        <p className="text-gray-500 mt-1">Administra las opciones del sistema</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'razones' && <RazonesSocialesConfig />}
      {tab === 'puestos' && <PuestosConfig />}
      {tab === 'areas' && <AreasConfig />}
      {tab === 'subareas' && <SubAreasConfig />}
      {tab === 'bancos' && <BancosConfig />}
    </div>
  );
}

// Razones Sociales
function RazonesSocialesConfig() {
  const [items, setItems] = useState<RazonSocial[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RazonSocial | null>(null);
  const [form, setForm] = useState({ nombre: '', rfc: '', registroPatronal: '', direccion: '' });

  useEffect(() => { setItems(getRazonesSociales()); }, []);

  function handleSave() {
    if (editing) {
      const updated = items.map(i => i.id === editing.id ? { ...i, ...form } : i);
      saveRazonesSociales(updated);
      setItems(updated);
    } else {
      const newItem: RazonSocial = { id: generarId(), ...form };
      const updated = [...items, newItem];
      saveRazonesSociales(updated);
      setItems(updated);
    }
    resetForm();
  }

  function handleDelete(id: string) {
    const updated = items.filter(i => i.id !== id);
    saveRazonesSociales(updated);
    setItems(updated);
  }

  function handleEdit(item: RazonSocial) {
    setEditing(item);
    setForm({ nombre: item.nombre, rfc: item.rfc, registroPatronal: item.registroPatronal, direccion: item.direccion });
    setShowForm(true);
  }

  function resetForm() {
    setForm({ nombre: '', rfc: '', registroPatronal: '', direccion: '' });
    setEditing(null);
    setShowForm(false);
  }

  return (
    <ConfigSection
      title="Razones Sociales"
      description="Administra las entidades legales de la empresa"
      items={items}
      showForm={showForm}
      onAdd={() => setShowForm(true)}
      renderForm={
        <div className="space-y-3">
          <input placeholder="Nombre de la razón social *" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} className="input-field" />
          <input placeholder="RFC *" value={form.rfc} onChange={e => setForm(p => ({ ...p, rfc: e.target.value }))} className="input-field" />
          <input placeholder="Registro Patronal IMSS" value={form.registroPatronal} onChange={e => setForm(p => ({ ...p, registroPatronal: e.target.value }))} className="input-field" />
          <input placeholder="Dirección fiscal" value={form.direccion} onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))} className="input-field" />
        </div>
      }
      onSave={handleSave}
      onCancel={resetForm}
      renderList={
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800 text-sm">{item.nombre}</p>
                <p className="text-xs text-gray-500">RFC: {item.rfc} • Reg. Patronal: {item.registroPatronal || '-'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-400 text-center py-4 text-sm">No hay razones sociales registradas</p>}
        </div>
      }
    />
  );
}

// Puestos
function PuestosConfig() {
  const [items, setItems] = useState<Puesto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Puesto | null>(null);
  const [form, setForm] = useState({ nombre: '', nivel: 'operativo' as NivelPuesto, descripcion: '' });

  useEffect(() => { setItems(getPuestos()); }, []);

  const nivelDias: Record<NivelPuesto, number> = { operativo: 30, administrativo: 90, direccion: 179 };

  function handleSave() {
    if (editing) {
      const updated = items.map(i => i.id === editing.id ? { ...i, ...form } : i);
      savePuestos(updated);
      setItems(updated);
    } else {
      const newItem: Puesto = { id: generarId(), ...form };
      const updated = [...items, newItem];
      savePuestos(updated);
      setItems(updated);
    }
    resetForm();
  }

  function handleDelete(id: string) {
    const updated = items.filter(i => i.id !== id);
    savePuestos(updated);
    setItems(updated);
  }

  function handleEdit(item: Puesto) {
    setEditing(item);
    setForm({ nombre: item.nombre, nivel: item.nivel, descripcion: item.descripcion || '' });
    setShowForm(true);
  }

  function resetForm() {
    setForm({ nombre: '', nivel: 'operativo', descripcion: '' });
    setEditing(null);
    setShowForm(false);
  }

  return (
    <ConfigSection
      title="Puestos"
      description="Configura los puestos y su nivel para determinar periodos de prueba"
      items={items}
      showForm={showForm}
      onAdd={() => setShowForm(true)}
      renderForm={
        <div className="space-y-3">
          <input placeholder="Nombre del puesto *" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} className="input-field" />
          <select value={form.nivel} onChange={e => setForm(p => ({ ...p, nivel: e.target.value as NivelPuesto }))} className="input-field">
            <option value="operativo">Operativo (30 días de prueba)</option>
            <option value="administrativo">Administrativo / Mandos Medios (90 días de prueba)</option>
            <option value="direccion">Dirección (179 días de prueba)</option>
          </select>
          <div className="p-2 bg-indigo-50 rounded-lg text-sm text-indigo-700">
            Periodo de prueba: <strong>{nivelDias[form.nivel]} días</strong>
          </div>
          <input placeholder="Descripción (opcional)" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} className="input-field" />
        </div>
      }
      onSave={handleSave}
      onCancel={resetForm}
      renderList={
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800 text-sm">{item.nombre}</p>
                <p className="text-xs text-gray-500">
                  Nivel: {item.nivel === 'operativo' ? 'Operativo' : item.nivel === 'administrativo' ? 'Administrativo' : 'Dirección'} • 
                  Prueba: {nivelDias[item.nivel]} días
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-400 text-center py-4 text-sm">No hay puestos registrados</p>}
        </div>
      }
    />
  );
}

// Áreas
function AreasConfig() {
  const [items, setItems] = useState<Area[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Area | null>(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });

  useEffect(() => { setItems(getAreas()); }, []);

  function handleSave() {
    if (editing) {
      const updated = items.map(i => i.id === editing.id ? { ...i, ...form } : i);
      saveAreas(updated);
      setItems(updated);
    } else {
      const newItem: Area = { id: generarId(), ...form };
      const updated = [...items, newItem];
      saveAreas(updated);
      setItems(updated);
    }
    resetForm();
  }

  function handleDelete(id: string) {
    const updated = items.filter(i => i.id !== id);
    saveAreas(updated);
    setItems(updated);
  }

  function handleEdit(item: Area) {
    setEditing(item);
    setForm({ nombre: item.nombre, descripcion: item.descripcion || '' });
    setShowForm(true);
  }

  function resetForm() {
    setForm({ nombre: '', descripcion: '' });
    setEditing(null);
    setShowForm(false);
  }

  return (
    <ConfigSection
      title="Áreas de Trabajo"
      description="Define las áreas o departamentos de la empresa"
      items={items}
      showForm={showForm}
      onAdd={() => setShowForm(true)}
      renderForm={
        <div className="space-y-3">
          <input placeholder="Nombre del área *" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} className="input-field" />
          <input placeholder="Descripción (opcional)" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} className="input-field" />
        </div>
      }
      onSave={handleSave}
      onCancel={resetForm}
      renderList={
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800 text-sm">{item.nombre}</p>
                <p className="text-xs text-gray-500">{item.descripcion || 'Sin descripción'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-400 text-center py-4 text-sm">No hay áreas registradas</p>}
        </div>
      }
    />
  );
}

// Sub Áreas
function SubAreasConfig() {
  const [items, setItems] = useState<SubArea[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SubArea | null>(null);
  const [form, setForm] = useState({ nombre: '', areaId: '' });

  useEffect(() => {
    setItems(getSubAreas());
    setAreas(getAreas());
  }, []);

  function handleSave() {
    if (editing) {
      const updated = items.map(i => i.id === editing.id ? { ...i, ...form } : i);
      saveSubAreas(updated);
      setItems(updated);
    } else {
      const newItem: SubArea = { id: generarId(), ...form };
      const updated = [...items, newItem];
      saveSubAreas(updated);
      setItems(updated);
    }
    resetForm();
  }

  function handleDelete(id: string) {
    const updated = items.filter(i => i.id !== id);
    saveSubAreas(updated);
    setItems(updated);
  }

  function handleEdit(item: SubArea) {
    setEditing(item);
    setForm({ nombre: item.nombre, areaId: item.areaId });
    setShowForm(true);
  }

  function resetForm() {
    setForm({ nombre: '', areaId: '' });
    setEditing(null);
    setShowForm(false);
  }

  return (
    <ConfigSection
      title="Sub Áreas"
      description="Define las sub áreas dentro de cada departamento"
      items={items}
      showForm={showForm}
      onAdd={() => setShowForm(true)}
      renderForm={
        <div className="space-y-3">
          <input placeholder="Nombre de la sub área *" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} className="input-field" />
          <select value={form.areaId} onChange={e => setForm(p => ({ ...p, areaId: e.target.value }))} className="input-field">
            <option value="">Seleccionar área padre *</option>
            {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>
      }
      onSave={handleSave}
      onCancel={resetForm}
      renderList={
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800 text-sm">{item.nombre}</p>
                <p className="text-xs text-gray-500">Área: {areas.find(a => a.id === item.areaId)?.nombre || '-'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-400 text-center py-4 text-sm">No hay sub áreas registradas</p>}
        </div>
      }
    />
  );
}

// Bancos
function BancosConfig() {
  const [items, setItems] = useState<Banco[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Banco | null>(null);
  const [form, setForm] = useState({ nombre: '', clave: '' });

  useEffect(() => { setItems(getBancos()); }, []);

  function handleSave() {
    if (editing) {
      const updated = items.map(i => i.id === editing.id ? { ...i, ...form } : i);
      saveBancos(updated);
      setItems(updated);
    } else {
      const newItem: Banco = { id: generarId(), ...form };
      const updated = [...items, newItem];
      saveBancos(updated);
      setItems(updated);
    }
    resetForm();
  }

  function handleDelete(id: string) {
    const updated = items.filter(i => i.id !== id);
    saveBancos(updated);
    setItems(updated);
  }

  function handleEdit(item: Banco) {
    setEditing(item);
    setForm({ nombre: item.nombre, clave: item.clave || '' });
    setShowForm(true);
  }

  function resetForm() {
    setForm({ nombre: '', clave: '' });
    setEditing(null);
    setShowForm(false);
  }

  return (
    <ConfigSection
      title="Bancos para Nómina"
      description="Bancos con los que se genera la nómina de los colaboradores"
      items={items}
      showForm={showForm}
      onAdd={() => setShowForm(true)}
      renderForm={
        <div className="space-y-3">
          <input placeholder="Nombre del banco *" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} className="input-field" />
          <input placeholder="Clave bancaria (STP)" value={form.clave} onChange={e => setForm(p => ({ ...p, clave: e.target.value }))} className="input-field" />
        </div>
      }
      onSave={handleSave}
      onCancel={resetForm}
      renderList={
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800 text-sm">{item.nombre}</p>
                <p className="text-xs text-gray-500">Clave: {item.clave || '-'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-400 text-center py-4 text-sm">No hay bancos registrados</p>}
        </div>
      }
    />
  );
}

// Reusable Config Section
function ConfigSection({ title, description, items, showForm, onAdd, renderForm, onSave, onCancel, renderList }: {
  title: string;
  description: string;
  items: any[];
  showForm: boolean;
  onAdd: () => void;
  renderForm: React.ReactNode;
  onSave: () => void;
  onCancel: () => void;
  renderList: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </div>

      {showForm && (
        <div className="p-6 border-b border-gray-100 bg-indigo-50/30">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {title.replace(/s$/, '')} - {items.length > 0 ? 'Editar' : 'Nuevo'}
          </h3>
          {renderForm}
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onCancel} className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              <Save className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </div>
      )}

      <div className="p-6">
        <p className="text-xs text-gray-400 mb-3">{items.length} registro(s)</p>
        {renderList}
      </div>
    </div>
  );
}
