import { NivelPuesto } from '../types';
import { format, differenceInDays, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Calcular días de periodo de prueba según nivel
export function getPeriodoPruebaDias(nivel: NivelPuesto): number {
  switch (nivel) {
    case 'operativo': return 30;
    case 'administrativo': return 90;
    case 'direccion': return 179;
    default: return 30;
  }
}

// Calcular fecha fin de periodo de prueba
export function calcularFechaFinPeriodoPrueba(fechaIngreso: string, dias: number): string {
  const fecha = parseISO(fechaIngreso);
  return format(addDays(fecha, dias), 'yyyy-MM-dd');
}

// Calcular días de vacaciones según antigüedad (Ley Federal del Trabajo - Reforma 2023)
export function calcularDiasVacaciones(aniosAntiguedad: number): number {
  if (aniosAntiguedad < 1) return 0;
  if (aniosAntiguedad === 1) return 12;
  if (aniosAntiguedad === 2) return 14;
  if (aniosAntiguedad === 3) return 16;
  if (aniosAntiguedad === 4) return 18;
  if (aniosAntiguedad === 5) return 20;
  // A partir del 6to año, se incrementan 2 días por cada año adicional
  return 20 + (aniosAntiguedad - 5) * 2;
}

// Calcular antigüedad en años
export function calcularAntiguedad(fechaIngreso: string): number {
  const inicio = parseISO(fechaIngreso);
  const hoy = new Date();
  const dias = differenceInDays(hoy, inicio);
  return Math.floor(dias / 365);
}

// Calcular días de vacaciones disponibles
export function calcularDiasDisponibles(fechaIngreso: string, diasTomados: number): number {
  const anios = calcularAntiguedad(fechaIngreso);
  const diasTotales = calcularDiasVacaciones(anios);
  return Math.max(0, diasTotales - diasTomados);
}

// Formatear fecha
export function formatFecha(fecha: string, formato: string = 'dd/MM/yyyy'): string {
  try {
    return format(parseISO(fecha), formato, { locale: es });
  } catch {
    return fecha;
  }
}

// Calcular días entre dos fechas
export function calcularDiasEntre(fechaInicio: string, fechaFin: string): number {
  const inicio = parseISO(fechaInicio);
  const fin = parseISO(fechaFin);
  return differenceInDays(fin, inicio) + 1;
}

// Validar CURP (formato básico)
export function validarCURP(curp: string): boolean {
  const pattern = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
  return pattern.test(curp.toUpperCase());
}

// Validar RFC (formato básico)
export function validarRFC(rfc: string): boolean {
  const pattern = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
  return pattern.test(rfc.toUpperCase());
}

// Generar ID único
export function generarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Calcular prima vacacional (25% sobre salario según LFT)
export function calcularPrimaVacacional(salarioDiario: number, diasVacaciones: number): number {
  return salarioDiario * diasVacaciones * 0.25;
}

// Estado del periodo de prueba
export function getEstadoPeriodoPrueba(fechaFin: string): 'vigente' | 'vencido' | 'por_vencer' {
  const hoy = new Date();
  const fin = parseISO(fechaFin);
  const diasRestantes = differenceInDays(fin, hoy);
  
  if (diasRestantes < 0) return 'vencido';
  if (diasRestantes <= 7) return 'por_vencer';
  return 'vigente';
}
