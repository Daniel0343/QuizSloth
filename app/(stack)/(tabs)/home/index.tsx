import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import HomeInvitado from './HomeInvitado';
import HomeUsuario from './HomePrincipal';

export default function HomeScreen() {
  const { user } = useAuthStore();

  if (!user || user.rol === 'invitado') return <HomeInvitado />;
  return <HomeUsuario />;
}
