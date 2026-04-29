export type EstadoSubscripcion = 'activa' | 'expirada' | 'sin_subscripcion';

export interface Subscripcion {
  estado: EstadoSubscripcion;
  plan: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  odooId: number | null;
}
