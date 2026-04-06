export type Rol = 'profesor' | 'alumno';

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  odoo_id?: number | null;
  fecha_registro?: string;
}
