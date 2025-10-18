/**
 * Utilidades para manejo de imágenes
 */

const S3_BASE_URL = 'https://villding.s3.us-east-2.amazonaws.com';

/**
 * Convierte una ruta de imagen en una fuente válida para React Native Image
 *
 * @param imageUri - URI de la imagen (puede ser local, URL completa, o ruta relativa de S3)
 * @returns Objeto con la URI procesada o require para imagen placeholder
 *
 * @example
 * // Imagen local del dispositivo
 * getImageSource('file:///path/to/image.jpg')
 * // => { uri: 'file:///path/to/image.jpg' }
 *
 * // URL completa de S3
 * getImageSource('https://villding.s3.us-east-2.amazonaws.com/activities/xxx.jpeg')
 * // => { uri: 'https://villding.s3.us-east-2.amazonaws.com/activities/xxx.jpeg' }
 *
 * // Ruta relativa de S3
 * getImageSource('activities/xxx.jpeg')
 * // => { uri: 'https://villding.s3.us-east-2.amazonaws.com/activities/xxx.jpeg' }
 */
export const getImageSource = (imageUri: string | undefined | null) => {
  // Si no hay imagen, retornar placeholder
  if (!imageUri || typeof imageUri !== 'string' || imageUri.trim() === '') {
    return require('../assets/images/add_img.png');
  }

  const cleanUri = imageUri.trim();

  // Imágenes locales (recién seleccionadas desde el dispositivo)
  if (cleanUri.startsWith('file://') || cleanUri.startsWith('content://')) {
    return { uri: cleanUri };
  }

  // Si ya es una URL completa (http:// o https://), usarla directamente
  if (cleanUri.startsWith('http://') || cleanUri.startsWith('https://')) {
    return { uri: cleanUri };
  }

  // Si es una ruta relativa de S3, convertirla en URL completa
  // Ejemplo: "activities/xxx.jpeg" -> "https://villding.s3.us-east-2.amazonaws.com/activities/xxx.jpeg"
  return { uri: `${S3_BASE_URL}/${cleanUri}` };
};

/**
 * Normaliza el formato de las imágenes según su tipo
 * Convierte strings, JSON strings, o valores individuales en un array de strings
 *
 * @param image - Imagen en cualquier formato (string, JSON string, array, o valor individual)
 * @returns Array de strings con las URIs de las imágenes
 *
 * @example
 * normalizeImages('image.jpg') // => ['image.jpg']
 * normalizeImages('["img1.jpg", "img2.jpg"]') // => ['img1.jpg', 'img2.jpg']
 * normalizeImages(['img1.jpg', 'img2.jpg']) // => ['img1.jpg', 'img2.jpg']
 */
export const normalizeImages = (image: any): string[] => {
  if (!image) {
    return [];
  }

  if (typeof image === 'string') {
    // Intentar parsear como JSON primero
    try {
      const parsed = JSON.parse(image);
      // Si el parse fue exitoso y es un array, devolverlo
      if (Array.isArray(parsed)) {
        return parsed;
      }
      // Si es un objeto o valor único parseado, convertirlo en array
      return [parsed];
    } catch (e) {
      // Si falla el parse, es un string simple
      return [image];
    }
  }

  // Si ya es un array, devolverlo tal cual
  if (Array.isArray(image)) {
    return image;
  }

  // Caso por defecto: convertir en array
  return [image];
};
