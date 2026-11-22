import { useContext } from 'react';
import { ThemeContext, type ThemeValue } from './ThemeProvider';

export function useTheme(): ThemeValue {
  const v = useContext(ThemeContext);
  if (!v) throw new Error('useTheme must be used inside <ThemeProvider>');
  return v;
}
