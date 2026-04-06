import { quizslothApi } from '../api/quizslothApi';
import { Rol, User } from '../interface/user';

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

export const authLogin = async (email: string, password: string) => {
  email = email.toLowerCase().trim();
  try {
    const { data } = await quizslothApi.post<AuthResponse>('/auth/login', { email, password });
    return data;
  } catch (error) {
    console.log('authLogin error:', error);
    return null;
  }
};

export const authRegister = async (
  nombre: string,
  email: string,
  password: string,
  rol: Rol,
) => {
  email = email.toLowerCase().trim();
  nombre = nombre.trim();
  try {
    const { data } = await quizslothApi.post<AuthResponse>('/auth/register', {
      nombre,
      email,
      password,
      rol,
    });
    return data;
  } catch (error) {
    console.log('authRegister error:', error);
    return null;
  }
};
