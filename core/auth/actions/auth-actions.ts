import { quizslothApi } from '../api/quizslothApi';
import { Rol } from '../interface/user';
import { AuthResponse } from '../interface/auth';

export type { AuthResponse };

// Inicia sesión con email y contraseña, devuelve los datos del usuario y el token o null si falla
export const authLogin = async (email: string, password: string) => {
  email = email.toLowerCase().trim();
  try {
    const { data } = await quizslothApi.post<AuthResponse>('/auth/login', { email, password });
    return data;
  } catch (error) {
    return null;
  }
};

// Registra un nuevo usuario con nombre, email, contraseña y rol, devuelve los datos o null si falla
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
    return null;
  }
};
