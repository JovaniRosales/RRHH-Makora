// Tipos principales de la aplicación de RH

export type NivelPuesto = 'operativo' | 'administrativo' | 'direccion';

export interface Colaborador {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  curp: string;
  rfc: string;
  nss: string;
  fechaNacimiento: string;
  fechaIngreso: string;
  fechaBaja?: string;
  email: string;
  telefono: string;
  direccion: string;
  puestoId: string;
  areaId: string;
  subAreaId?: string;
  razonSocialId: string;
  nivelPuesto: NivelPuesto;
  periodoPruebaDias: number;
  fechaFinPeriodoPrueba: string;
  estado: 'activo' | 'baja_programada' | 'baja' | 'periodo_prueba';
  bancoId?: string;
  clabe?: string;
  salarioDiario: number;
  diasVacaciones: number;
  diasVacacionesTomados: number;
  diasVacacionesDisponibles: number;
  primaVacacional: number;
  documentos: Documento[];
  notas?: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  estadoCivil?: string;
  genero?: string;
}

export interface Documento {
  id: string;
  nombre: string;
  tipo: string;
  fechaCarga: string;
  tamaño: string;
}

export interface Baja {
  id: string;
  colaboradorId: string;
  tipo: 'programada' | 'no_programada';
  motivo: string;
  fechaBaja: string;
  fechaNotificacion?: string;
  fechaProgramada?: string;
  observaciones: string;
  estado: 'pendiente' | 'procesada' | 'cancelada';
  createdAt: string;
}

export type TipoIncidencia = 'vacaciones' | 'horas_extras' | 'incapacidad' | 'ausentismo' | 'permiso';

export interface Incidencia {
  id: string;
  colaboradorId: string;
  tipo: TipoIncidencia;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  horas?: number;
  motivo: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  observaciones: string;
  createdAt: string;
}

export interface RazonSocial {
  id: string;
  nombre: string;
  rfc: string;
  registroPatronal: string;
  direccion: string;
}

export interface Puesto {
  id: string;
  nombre: string;
  nivel: NivelPuesto;
  descripcion?: string;
}

export interface Area {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface SubArea {
  id: string;
  nombre: string;
  areaId: string;
}

export interface Banco {
  id: string;
  nombre: string;
  clave?: string;
}

export interface Departamento {
  id: string;
  nombre: string;
}

export interface TipoContrato {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface Jornada {
  id: string;
  nombre: string;
  horasSemanales: number;
}
