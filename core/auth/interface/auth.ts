import { Rol } from './user';

export interface AuthResponse {
  user: {
    id: number;
    nombre: string;
    email: string;
    rol: Rol;
    odoo_id?: number | null;
    fecha_registro?: string;
  };
  token: string;
}
