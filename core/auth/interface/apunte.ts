export interface Referencia {
  titulo: string;
  url: string;
  descripcion: string;
}

export interface Seccion {
  titulo: string;
  contenido: string;
  puntosClave: string[];
}

export interface ApunteContenido {
  titulo: string;
  resumen: string;
  secciones: Seccion[];
  referencias: Referencia[];
}

export interface ApunteResumen {
  id: number;
  titulo: string;
  fechaCreacion: string;
}

export interface ApunteDetalle {
  id: number;
  titulo: string;
  contenidoJson: string;
  fechaCreacion: string;
}
