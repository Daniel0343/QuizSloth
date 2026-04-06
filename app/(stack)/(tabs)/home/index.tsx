import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import HomeProfesor from './HomeProfesor';
import HomeAlumno from './HomeAlumno';
import HomeInvitado from './HomeInvitado';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const rol = user?.rol ?? 'invitado';

  if (rol === 'profesor') return <HomeProfesor />;
  if (rol === 'alumno')   return <HomeAlumno />;
  return <HomeInvitado />;
}
