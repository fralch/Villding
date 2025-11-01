/**
 * Configuración para subida de archivos e imágenes
 * Centraliza todos los límites y configuraciones relacionadas con uploads
 */

export const UPLOAD_CONFIG = {
  // Límites de tamaño de archivo
  MAX_FILE_SIZE: {
    // Tamaño máximo antes de comprimir (50MB)
    BEFORE_COMPRESSION: 50 * 1024 * 1024,
    
    // Tamaño máximo después de comprimir (5MB)
    AFTER_COMPRESSION: 5 * 1024 * 1024,
    
    // Tamaño máximo para validación inicial (10MB)
    VALIDATION_LIMIT: 10 * 1024 * 1024,
    
    // Tamaño máximo total de todas las imágenes (20MB)
    TOTAL_IMAGES_LIMIT: 20 * 1024 * 1024
  },

  // Configuración de timeouts
  TIMEOUTS: {
    // Timeout para requests con imágenes (60 segundos)
    IMAGE_UPLOAD: 60000,
    
    // Timeout para requests normales (30 segundos)
    NORMAL_REQUEST: 30000
  },

  // Configuración de compresión
  COMPRESSION: {
    // Calidad de compresión por defecto
    DEFAULT_QUALITY: 0.7,
    
    // Dimensiones máximas por defecto
    DEFAULT_MAX_WIDTH: 1024,
    DEFAULT_MAX_HEIGHT: 1024,
    
    // Compresión agresiva para imágenes muy grandes
    AGGRESSIVE_QUALITY: 0.5,
    AGGRESSIVE_MAX_WIDTH: 512,
    AGGRESSIVE_MAX_HEIGHT: 512
  },

  // Formatos de imagen soportados
  SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],

  // Mensajes de error
  ERROR_MESSAGES: {
    FILE_TOO_LARGE: 'La imagen es demasiado grande. Será comprimida automáticamente.',
    COMPRESSION_FAILED: 'Error al comprimir la imagen. Intente con una imagen más pequeña.',
    UPLOAD_FAILED: 'Error al subir las imágenes. Verifique su conexión e intente nuevamente.',
    INVALID_FORMAT: 'Formato de imagen no soportado. Use JPG, PNG o WebP.',
    NETWORK_ERROR: 'Error de conexión. Verifique su internet e intente nuevamente.',
    SERVER_ERROR: 'Error del servidor. Intente nuevamente en unos momentos.',
    PAYLOAD_TOO_LARGE: 'Las imágenes son demasiado grandes. Intente con menos imágenes o de menor tamaño.'
  }
};

/**
 * Obtiene el mensaje de error apropiado basado en el código de estado HTTP
 */
export const getErrorMessage = (statusCode?: number): string => {
  switch (statusCode) {
    case 413:
      return UPLOAD_CONFIG.ERROR_MESSAGES.PAYLOAD_TOO_LARGE;
    case 408:
    case 504:
      return UPLOAD_CONFIG.ERROR_MESSAGES.NETWORK_ERROR;
    case 500:
    case 502:
    case 503:
      return UPLOAD_CONFIG.ERROR_MESSAGES.SERVER_ERROR;
    default:
      return UPLOAD_CONFIG.ERROR_MESSAGES.UPLOAD_FAILED;
  }
};

/**
 * Formatea el tamaño de archivo en una cadena legible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Verifica si el formato de imagen es soportado
 */
export const isSupportedImageFormat = (filename: string): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? UPLOAD_CONFIG.SUPPORTED_FORMATS.includes(extension) : false;
};