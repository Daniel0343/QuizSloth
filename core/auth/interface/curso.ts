export interface CursoResumen {
  id: number;
  nombre: string;
  descripcion?: string;
  profesor?: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
}
