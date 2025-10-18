import Constants from 'expo-constants';

// Leer apiBaseUrl expuesto en app.config.js -> expo.extra.apiBaseUrl
const extra = (Constants?.expoConfig as any)?.extra || (Constants as any)?.manifest?.extra || {};
const RAW_DOMAIN: string = extra?.apiBaseUrl || 'https://villding.lat';

// Normaliza y expone constantes
const DOMAIN = RAW_DOMAIN.replace(/\/+$/, '');
export const API_DOMAIN = DOMAIN;
export const API_BASE_URL = `${DOMAIN}/endpoint`;

// Helper para construir URLs a partir de rutas
export const apiUrl = (path: string): string => {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${p}`;
};