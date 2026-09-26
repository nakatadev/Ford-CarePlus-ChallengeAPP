import { Redirect, Stack } from 'expo-router';
import { colors } from '@/constants/theme';
import { useAuth } from '@/store/AuthContext';

/** Cockpit da concessionária: rota protegida (perfil "concessionaria"). */
export default function CockpitLayout() {
  const { user, isRestoring } = useAuth();
  if (isRestoring) return null;
  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'concessionaria') return <Redirect href="/inicio" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }} />;
}
