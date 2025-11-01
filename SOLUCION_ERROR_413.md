# Solución para Error 413 - Payload Too Large

## 🚨 Problema Original
```
ERROR  Error updating activity: [AxiosError: Request failed with status code 413] 
LOG  Update result: false 
LOG  Operation failed
```

El error 413 indica que el payload de la request es demasiado grande, típicamente causado por imágenes de alta resolución sin comprimir.

## ✅ Solución Implementada

### 1. **Compresión Automática de Imágenes**
- **Archivo**: `src/utils/imageCompression.ts`
- **Funcionalidad**: Comprime automáticamente las imágenes antes de subirlas
- **Presets disponibles**: LOW, MEDIUM, HIGH, AGGRESSIVE
- **Tecnología**: `expo-image-manipulator`

### 2. **Validación de Tamaño**
- **Pre-validación**: Verifica el tamaño antes de comprimir
- **Post-validación**: Confirma que las imágenes comprimidas están dentro del límite
- **Límites configurables**: 10MB para validación, 5MB después de compresión

### 3. **Configuración Centralizada**
- **Archivo**: `src/config/uploadConfig.ts`
- **Incluye**:
  - Límites de tamaño de archivo
  - Timeouts para diferentes tipos de request
  - Mensajes de error específicos
  - Formatos soportados

### 4. **Manejo Mejorado de Errores**
- **Error 413**: "Error del servidor (413: Payload demasiado grande)"
- **Error 408**: "Tiempo de espera agotado"
- **Timeout**: "Tiempo de espera agotado. Las imágenes pueden ser demasiado grandes."
- **Compresión fallida**: Mensaje específico con instrucciones

### 5. **Timeouts Aumentados**
- **Uploads con imágenes**: 120 segundos (2 minutos)
- **Requests normales**: 30 segundos
- **Permite manejar archivos más grandes**

## 📁 Archivos Modificados

### Nuevos Archivos:
1. `src/utils/imageCompression.ts` - Utilidades de compresión
2. `src/config/uploadConfig.ts` - Configuración centralizada

### Archivos Actualizados:
1. `src/components/Activities/ActivityItemComplete.tsx`
2. `src/components/Activities/ActivityItemUpdate.tsx`

## 🔧 Funciones Principales

### `compressImages(imageUris, preset)`
```typescript
// Comprime un array de imágenes con el preset especificado
const compressedImages = await compressImages(localImages, COMPRESSION_PRESETS.MEDIUM);
```

### `validateImagesSize(imageUris, maxSize)`
```typescript
// Valida que las imágenes no excedan el tamaño máximo
const validation = await validateImagesSize(images, UPLOAD_CONFIG.MAX_FILE_SIZE.VALIDATION_LIMIT);
```

### `getErrorMessage(statusCode)`
```typescript
// Obtiene mensaje de error específico basado en el código HTTP
const errorMessage = getErrorMessage(error.response?.status);
```

## 🚀 Flujo de Procesamiento

1. **Selección de Imágenes**: Usuario selecciona imágenes
2. **Validación Inicial**: Se verifica el tamaño de imágenes locales
3. **Alerta al Usuario**: Si hay imágenes grandes, se informa que serán comprimidas
4. **Compresión**: Al subir, se comprimen automáticamente las imágenes nuevas
5. **Validación Post-Compresión**: Se verifica que estén dentro del límite
6. **Upload**: Se envían con timeout extendido y manejo de errores específico

## 📊 Configuración por Defecto

```typescript
const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: {
    VALIDATION_LIMIT: 10 * 1024 * 1024,    // 10MB - límite antes de comprimir
    AFTER_COMPRESSION: 5 * 1024 * 1024     // 5MB - límite después de comprimir
  },
  TIMEOUTS: {
    IMAGE_UPLOAD: 120000,    // 2 minutos para uploads con imágenes
    NORMAL_REQUEST: 30000    // 30 segundos para requests normales
  }
};
```

## 🎯 Preset de Compresión MEDIUM

```typescript
MEDIUM: {
  compress: 0.7,           // 70% de calidad
  format: SaveFormat.JPEG, // Formato JPEG para mejor compresión
  resize: { width: 1920 }  // Redimensionar a máximo 1920px de ancho
}
```

## ✨ Beneficios

1. **Reduce significativamente el tamaño de las imágenes**
2. **Mantiene calidad visual aceptable**
3. **Evita errores 413 del servidor**
4. **Mejora la experiencia del usuario con mensajes informativos**
5. **Configuración centralizada y fácil de mantener**
6. **Manejo robusto de errores**

## 🧪 Pruebas

Se incluye un script de prueba (`test_image_upload.js`) que simula diferentes escenarios:
- Imágenes pequeñas
- Imágenes medianas
- Imágenes grandes
- Mezcla de tamaños
- Manejo de errores

## 📱 Experiencia del Usuario

1. **Transparente**: La compresión ocurre automáticamente
2. **Informativa**: Se notifica cuando hay imágenes grandes
3. **Robusta**: Manejo de errores con mensajes claros
4. **Rápida**: Timeouts apropiados para diferentes escenarios

---

**Resultado**: El error 413 debería estar resuelto con estas mejoras implementadas.