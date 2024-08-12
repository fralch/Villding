// useColors.ts
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from './themes';
import { ThemeMode } from './../types/data';

function useColors(mode: ThemeMode = 'dark') {
  const colorScheme = useColorScheme();
  const m = colorScheme ?? mode;
  const theme = m === 'dark' ? darkTheme : lightTheme;

  const colors = {
    bg10: theme.background[10],
    bg20: theme.background[20],
    bg30: theme.background[30],
    txt60: theme.text[60],
    txt80: theme.text[80],
    txt: theme.text[80], // You can customize this based on your needs
    danger: theme.danger,
    warning: theme.warning,
    success: theme.success,
    primary: theme.primary,
    white: theme.white,
    accent: theme.accent,
  };

  const toggleColorMode = () => {
    // Implement your logic to toggle color mode
  };

  return {
    colors,
    colorMode: colorScheme,
    toggleColorMode,
  };
}

export default useColors;
