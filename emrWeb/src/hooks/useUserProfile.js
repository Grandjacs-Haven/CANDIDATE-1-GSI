import useAuth from './useAuth';
import { useUser } from './useUsers';

export default function useUserProfile() {
  const { userId } = useAuth();

  return useUser(userId);
}
