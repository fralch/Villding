import React, { useContext } from 'react';

type ColorMode = 'dark' | 'light';

interface Colors {
  bg10: string;
  bg20: string;
  bg30: string;
  txt60: string;
  txt80: string;
  txt: string;
  danger: string;
  warning: string;
  success: string;
  primary: string;
  white: string;
  accent: string;
}

interface ColorContextType {
  colors: Colors;
  colorMode: ColorMode;
  toggleColorMode: () => void;
}

const ColorContext = React.createContext<ColorContextType>({
  colors: {
    bg10: '',
    bg20: '',
    bg30: '',
    txt60: '',
    txt80: '',
    txt: '',
    danger: '',
    warning: '',
    success: '',
    primary: '',
    white: '',
    accent: '',
  },
  colorMode: 'dark',
  toggleColorMode: () => {},
});

export default function useColors(): ColorContextType {
  const { colors, colorMode, toggleColorMode } = useContext(ColorContext);
  return { colors, colorMode, toggleColorMode };
}

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorMode] = React.useState<ColorMode>('dark');

  const toggleColorMode = () => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark');
  };

  const colors: Colors = {
    bg10: colorMode === 'dark' ? '#121212' : '#ffffff',
    bg20: colorMode === 'dark' ? '#1f1f1f' : '#f2f2f2',
    bg30: colorMode === 'dark' ? '#2c2c2c' : '#e6e6e6',
    txt60: colorMode === 'dark' ? '#f2f2f2' : '#121212',
    txt80: colorMode === 'dark' ? '#cccccc' : '#333333',
    txt: colorMode === 'dark' ? '#ffffff' : '#000000',
    danger: '#ff3b30',
    warning: '#ff9500',
    success: '#30d158',
    primary: colorMode === 'dark' ? '#0a84ff' : '#007aff',
    white: '#ffffff',
    accent: '#5ac8fa',
  };
}
