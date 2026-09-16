import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { logoutUser } from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  );

  const isAdmin = user?.role === 'admin';

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    logout: handleLogout
  };
};

export default useAuth;
