import { useAutoJoinChannels } from '@/hooks/useAutoJoinChannels';

// Componente que usa o hook de auto-join dentro do contexto de auth
export function AutoJoinHandler() {
  useAutoJoinChannels();
  return null; // Este componente não renderiza nada, apenas executa o hook
}