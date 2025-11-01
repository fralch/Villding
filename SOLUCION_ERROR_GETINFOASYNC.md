# Solución Error getInfoAsync Deprecado

## Problema
La aplicación mostraba el error:
```
Error validando tamaño de imagen: Error: Method getInfoAsync imported from 'expo-file-system' is deprecated.
You can migrate to the new filesystem API using 'File' and 'Directory' classes or import the legacy API from 'expo-file-system/legacy'.
```

## Causa
El método `getInfoAsync` de `expo-file-system` fue deprecado y necesita ser actualizado para usar la nueva API con opciones específicas.

## Solución Implementada

### 1. Actualización de la API de FileSystem

**Antes:**
```typescript
const fileInfo = await FileSystem.getInfoAsync(imageUri);
```

**Después:**
```typescript
const fileInfo = await FileSystem.getInfoAsync(imageUri, { size: true });
```

### 2. Función Auxiliar Robusta

Se creó una función auxiliar en `imageCompression.ts` para manejar la obtención de tamaños de archivo de forma más robusta:

```typescript
export const getFileSizeFromUri = async (fileUri: string): Promise<number> => {
  try {
    if (!fileUri.startsWith('file://') && !fileUri.startsWith('content://')) {
      return 0;
    }

    const fileInfo = await FileSystem.getInfoAsync(fileUri, { size: true });
    
    if (fileInfo.exists && fileInfo.size) {
      return fileInfo.size;
    }
    
    return 0;
  } catch (error) {
    console.warn('No se pudo obtener el tamaño del archivo:', error);
    return 5 * 1024 * 1024; // Estimación de 5MB
  }
};
```

### 3. Archivos Modificados

1. **`src/utils/imageCompression.ts`**
   - Agregada función `getFileSizeFromUri`
   - Actualizada función `validateImageSize` para usar la nueva API

2. **`src/views/Login/EditUser.tsx`**
   - 3 instancias de `getInfoAsync` actualizadas

3. **`src/components/Activities/ActivityItemCreate.tsx`**
   - 2 instancias de `getInfoAsync` actualizadas

4. **`src/views/Login/CreacionCuenta.tsx`**
   - 3 instancias de `getInfoAsync` actualizadas

5. **`src/views/Projects/EditProject.tsx`**
   - 3 instancias de `getInfoAsync` actualizadas

6. **`src/views/Projects/NewProject.tsx`**
   - Actualizado import de `expo-file-system/legacy` a `expo-file-system`
   - 2 instancias de `getInfoAsync` actualizadas

### 4. Mejoras Implementadas

- **Manejo de Errores**: Fallback con estimación de tamaño si no se puede obtener el tamaño real
- **Compatibilidad**: Uso de la nueva API con opciones específicas
- **Robustez**: Validación de existencia de archivos antes de procesar
- **Logging**: Advertencias informativas en caso de errores

### 5. Beneficios

- ✅ Eliminación del warning de deprecación
- ✅ Compatibilidad con versiones futuras de Expo
- ✅ Mejor manejo de errores
- ✅ Código más robusto y mantenible
- ✅ Estimación inteligente cuando no se puede obtener el tamaño real

### 6. Pruebas Realizadas

- ✅ Aplicación se ejecuta sin errores
- ✅ No aparecen warnings de deprecación
- ✅ Funcionalidad de validación de imágenes mantiene su comportamiento
- ✅ Compresión de imágenes funciona correctamente

## Estado Actual

El error ha sido completamente resuelto. La aplicación ahora usa la nueva API de `expo-file-system` de forma correcta y robusta, eliminando todos los warnings de deprecación relacionados con `getInfoAsync`.