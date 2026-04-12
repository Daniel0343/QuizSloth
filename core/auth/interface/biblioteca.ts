export interface ItemBiblioteca {
  id: number;
  titulo: string;
  dificultad: string;
  categoria: string;
  numPreguntas: number;
  intentos: number;
}

export interface Coleccion {
  id: number;
  nombre: string;
  cantidad: number;
}
