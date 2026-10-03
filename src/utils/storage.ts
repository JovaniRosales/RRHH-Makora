import { Colaborador, Baja, Incidencia, RazonSocial, Puesto, Area, SubArea, Banco } from '../types';

const KEYS = {
  colaboradores: 'rh_colaboradores',
  bajas: 'rh_bajas',
  incidencias: 'rh_incidencias',
  razonesSociales: 'rh_razones_sociales',
  puestos: 'rh_puestos',
  areas: 'rh_areas',
  subAreas: 'rh_sub_areas',
  bancos: 'rh_bancos',
};

function getItem<T>(key: string, defaultValue: T[]): T[] {
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);
  return defaultValue;
}

function setItem<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Colaboradores
export const getColaboradores = (): Colaborador[] => getItem(KEYS.colaboradores, []);
export const saveColaboradores = (data: Colaborador[]) => setItem(KEYS.colaboradores, data);

// Bajas
export const getBajas = (): Baja[] => getItem(KEYS.bajas, []);
export const saveBajas = (data: Baja[]) => setItem(KEYS.bajas, data);

// Incidencias
export const getIncidencias = (): Incidencia[] => getItem(KEYS.incidencias, []);
export const saveIncidencias = (data: Incidencia[]) => setItem(KEYS.incidencias, data);

// Razones Sociales
export const getRazonesSociales = (): RazonSocial[] => getItem(KEYS.razonesSociales, []);
export const saveRazonesSociales = (data: RazonSocial[]) => setItem(KEYS.razonesSociales, data);

// Puestos
export const getPuestos = (): Puesto[] => getItem(KEYS.puestos, []);
export const savePuestos = (data: Puesto[]) => setItem(KEYS.puestos, data);

// Areas
export const getAreas = (): Area[] => getItem(KEYS.areas, []);
export const saveAreas = (data: Area[]) => setItem(KEYS.areas, data);

// Sub Areas
export const getSubAreas = (): SubArea[] => getItem(KEYS.subAreas, []);
export const saveSubAreas = (data: SubArea[]) => setItem(KEYS.subAreas, data);

// Bancos
export const getBancos = (): Banco[] => getItem(KEYS.bancos, []);
export const saveBancos = (data: Banco[]) => setItem(KEYS.bancos, data);

// Datos iniciales
export function initializeData() {
  if (!localStorage.getItem(KEYS.razonesSociales)) {
    saveRazonesSociales([
      { id: '1', nombre: 'Empresa Principal S.A. de C.V.', rfc: 'EPR200101XXX', registroPatronal: 'A00-00000-00-0000', direccion: 'Av. Principal #100' },
    ]);
  }
  if (!localStorage.getItem(KEYS.puestos)) {
    savePuestos([
      { id: '1', nombre: 'Director General', nivel: 'direccion' },
      { id: '2', nombre: 'Director de Operaciones', nivel: 'direccion' },
      { id: '3', nombre: 'Gerente de RH', nivel: 'administrativo' },
      { id: '4', nombre: 'Coordinador', nivel: 'administrativo' },
      { id: '5', nombre: 'Analista', nivel: 'administrativo' },
      { id: '6', nombre: 'Operador', nivel: 'operativo' },
      { id: '7', nombre: 'Auxiliar', nivel: 'operativo' },
    ]);
  }
  if (!localStorage.getItem(KEYS.areas)) {
    saveAreas([
      { id: '1', nombre: 'Dirección General' },
      { id: '2', nombre: 'Recursos Humanos' },
      { id: '3', nombre: 'Operaciones' },
      { id: '4', nombre: 'Finanzas' },
      { id: '5', nombre: 'Tecnología' },
    ]);
  }
  if (!localStorage.getItem(KEYS.subAreas)) {
    saveSubAreas([
      { id: '1', nombre: 'Reclutamiento', areaId: '2' },
      { id: '2', nombre: 'Nómina', areaId: '2' },
      { id: '3', nombre: 'Capacitación', areaId: '2' },
      { id: '4', nombre: 'Producción', areaId: '3' },
      { id: '5', nombre: 'Logística', areaId: '3' },
    ]);
  }
  if (!localStorage.getItem(KEYS.bancos)) {
    saveBancos([
      { id: '1', nombre: 'BBVA', clave: '012' },
      { id: '2', nombre: 'Banorte', clave: '014' },
      { id: '3', nombre: 'Santander', clave: '014' },
      { id: '4', nombre: 'Banamex', clave: '002' },
      { id: '5', nombre: 'HSBC', clave: '021' },
    ]);
  }
}
