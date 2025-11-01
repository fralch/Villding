/**
 * Utilidades para compresión de imágenes
 * Reduce el tamaño de las imágenes antes de subirlas al servidor
 */

import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: SaveFormat;
}

export interface ImageValidationResult {
  isValid: boolean;
  message?: string;
  sizeInBytes?: number;
}

/**
 * Obtiene el tamaño de un archivo de forma robusta
 * 
 * @param fileUri - URI del archivo
 * @returns Tamaño en bytes o 0 si no se puede obtener
 */
export const getFileSizeFromUri = async (fileUri: string): Promise<number> => {
  try {
    // Solo para archivos locales
    if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
      return 0;
    }

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    
    if (fileInfo.exists && fileInfo.size) {
      return fileInfo.size;
    }
    
    return 0;
  } catch (error) {
    console.warn('No se pudo obtener el tamaño del archivo:', error);
    // Estimación conservadora para imágenes típicas
    return 5 * 1024 * 1024; // 5MB
  }
};

/**
 * Valida el tamaño de una imagen
 * 
 * @param imageUri - URI de la imagen
 * @param maxSizeBytes - Tamaño máximo permitido en bytes (default: 10MB)
 * @returns Resultado de la validación
 */
export const validateImageSize = async (
  imageUri: string, 
  maxSizeBytes: number = 10 * 1024 * 1024
): Promise<ImageValidationResult> => {
  try {
    // Solo validar imágenes locales
    if (!imageUri.startsWith('file://') && !imageUri.startsWith('content://')) {
      return { isValid: true };
    }

    const sizeInBytes = await getFileSizeFromUri(imageUri);
    
    if (sizeInBytes === 0) {
      return { 
        isValid: false, 
        message: 'La imagen no existe o no se puede acceder a ella' 
      };
    }

    const sizeInMB = sizeInBytes / (1024 * 1024);

    if (sizeInBytes > maxSizeBytes) {
      return {
        isValid: false,
        message: `La imagen es demasiado grande (${sizeInMB.toFixed(1)}MB). Máximo permitido: ${(maxSizeBytes / (1024 * 1024)).toFixed(1)}MB`,
        sizeInBytes
      };
    }

    return { 
      isValid: true, 
      sizeInBytes 
    };

  } catch (error) {
    console.error('Error validando tamaño de imagen:', error);
    return { 
      isValid: false, 
      message: 'Error al validar el tamaño de la imagen' 
    };
  }
};

/**
 * Valida múltiples imágenes
 */
export const validateImagesSize = async (
  imageUris: string[],
  maxSizeBytes: number = 10 * 1024 * 1024
): Promise<{ isValid: boolean; invalidImages: string[]; messages: string[] }> => {
  const results = await Promise.all(
    imageUris.map(uri => validateImageSize(uri, maxSizeBytes))
  );

  const invalidImages: string[] = [];
  const messages: string[] = [];

  results.forEach((result, index) => {
    if (!result.isValid) {
      invalidImages.push(imageUris[index]);
      if (result.message) {
        messages.push(`Imagen ${index + 1}: ${result.message}`);
      }
    }
  });

  return {
    isValid: invalidImages.length === 0,
    invalidImages,
    messages
  };
};

/**
 * Comprime una imagen reduciendo su tamaño y calidad
 * 
 * @param imageUri - URI de la imagen a comprimir
 * @param options - Opciones de compresión
 * @returns URI de la imagen comprimida
 */
export const compressImage = async (
  imageUri: string, 
  options: CompressionOptions = {}
): Promise<string> => {
  try {
    const {
      maxWidth = 1024,
      maxHeight = 1024,
      quality = 0.7,
      format = SaveFormat.JPEG
    } = options;

    // Solo comprimir imágenes locales (nuevas)
    if (!imageUri.startsWith('file://') && !imageUri.startsWith('content://')) {
      return imageUri;
    }

    console.log('Comprimiendo imagen:', imageUri);

    // Validar tamaño antes de comprimir
    const validation = await validateImageSize(imageUri, 50 * 1024 * 1024); // 50MB máximo antes de comprimir
    if (!validation.isValid) {
      console.warn('Imagen muy grande para comprimir:', validation.message);
      throw new Error(validation.message);
    }

    const result = await manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          }
        }
      ],
      {
        compress: quality,
        format: format,
        base64: false
      }
    );

    console.log('Imagen comprimida exitosamente:', result.uri);
    
    // Validar que la imagen comprimida no sea demasiado grande
    const compressedValidation = await validateImageSize(result.uri, 5 * 1024 * 1024); // 5MB máximo después de comprimir
    if (!compressedValidation.isValid) {
      console.warn('Imagen comprimida aún muy grande, aplicando compresión adicional');
      
      // Aplicar compresión más agresiva
      const secondResult = await manipulateAsync(
        result.uri,
        [
          {
            resize: {
              width: 512,
              height: 512,
            }
          }
        ],
        {
          compress: 0.5,
          format: SaveFormat.JPEG,
          base64: false
        }
      );
      
      return secondResult.uri;
    }

    return result.uri;

  } catch (error) {
    console.error('Error al comprimir imagen:', error);
    // Si falla la compresión, devolver la imagen original
    return imageUri;
  }
};

/**
 * Comprime un array de imágenes con validación
 * 
 * @param imageUris - Array de URIs de imágenes
 * @param options - Opciones de compresión
 * @returns Array de URIs de imágenes comprimidas
 */
export const compressImages = async (
  imageUris: string[],
  options: CompressionOptions = {}
): Promise<string[]> => {
  try {
    // Validar todas las imágenes primero
    const validation = await validateImagesSize(imageUris);
    if (!validation.isValid) {
      console.warn('Algunas imágenes son demasiado grandes:', validation.messages);
      // Continuar con la compresión para intentar reducir el tamaño
    }

    const compressedImages = await Promise.all(
      imageUris.map(uri => compressImage(uri, options))
    );
    
    return compressedImages;
  } catch (error) {
    console.error('Error al comprimir imágenes:', error);
    // Si falla, devolver las imágenes originales
    return imageUris;
  }
};

/**
 * Obtiene el tamaño estimado de una imagen en bytes
 * (Aproximación basada en dimensiones y calidad)
 */
export const getEstimatedImageSize = (width: number, height: number, quality: number = 0.7): number => {
  // Estimación aproximada: width * height * 3 (RGB) * quality
  return Math.round(width * height * 3 * quality);
};

/**
 * Configuraciones predefinidas de compresión
 */
export const COMPRESSION_PRESETS = {
  LOW: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.8,
    format: SaveFormat.JPEG
  },
  MEDIUM: {
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.7,
    format: SaveFormat.JPEG
  },
  HIGH: {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.6,
    format: SaveFormat.JPEG
  }
} as const;