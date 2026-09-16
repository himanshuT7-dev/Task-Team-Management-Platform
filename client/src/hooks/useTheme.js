import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { toggleTheme, setTheme } from '../store/uiSlice';

export const useTheme = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);

  const handleToggle = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  const handleSetTheme = useCallback(
    (newTheme) => {
      dispatch(setTheme(newTheme));
    },
    [dispatch]
  );

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme: handleToggle,
    setTheme: handleSetTheme
  };
};

export default useTheme;
