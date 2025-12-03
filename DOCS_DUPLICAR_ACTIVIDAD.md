# Documentación: Endpoint para Duplicar Actividad

## Descripción General
Este endpoint permite duplicar una actividad existente, creando una nueva entrada en la base de datos con toda la información de la actividad original pero asignada a una nueva fecha.

El sistema maneja automáticamente:
1. **Duplicación de datos**: Copia todos los campos relevantes (nombre, descripción, ubicación, horas, etc.).
2. **Clonación de imágenes**: Las imágenes en S3 se **descargan y re-suben** con nuevos nombres UUID, garantizando total independencia entre la actividad original y la duplicada.
3. **Determinación de estado**: Calcula si el estado debe ser `pendiente` o `programado` basándose en la nueva fecha proporcionada.

## ⚙️ Requisitos Previos

### Configuración de S3
- El bucket S3 debe estar correctamente configurado (ver `S3_BUCKET_CONFIG.md`)
- Se requiere **Bucket Policy** para acceso público de lectura
- El sistema NO usa ACL a nivel de objeto (estándar moderno de AWS)
- Permisos IAM necesarios: `s3:GetObject`, `s3:PutObject`, `s3:ListBucket`

## Especificación del Endpoint

**URL**: `/endpoint/activities/duplicate`
**Método**: `POST`
**Autenticación**: Requerida (Token Bearer o sesión activa, dependiendo del contexto)

### Headers
```http
Content-Type: application/json
Accept: application/json
```

### Parámetros del Body (JSON)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `activity_id` | Integer | Sí | El ID de la actividad original que se desea duplicar. |
| `new_date` | Date (Y-m-d) | Sí | La nueva fecha para la actividad duplicada. |

**Ejemplo de Body:**
```json
{
    "activity_id": 123,
    "new_date": "2025-06-15"
}
```

## Comportamiento del Sistema

### 1. Validación
- Se verifica que el `activity_id` exista en la tabla `activities`.
- Se valida que `new_date` sea una fecha válida.

### 2. Lógica de Estado
El estado de la nueva actividad se determina comparando `new_date` con la fecha actual (Zona horaria: America/Lima):
- **Si `new_date` > Hoy**: Estado = `programado`
- **Si `new_date` <= Hoy**: Estado = `pendiente`

### 3. Procesamiento de Imágenes

El sistema utiliza un método robusto de **descarga y re-subida**:

1. Obtiene el array de imágenes de la actividad original
2. Para cada imagen:
   - **Verifica existencia** en S3
   - **Descarga contenido binario** completo
   - **Genera nuevo UUID** para el nombre
   - **Sube a S3** como nuevo archivo independiente
   - **Verifica subida exitosa**
   - Agrega al array de la nueva actividad
3. **Logging completo** de cada paso para debugging

**Fallback**: Si la imagen no está en S3, busca en almacenamiento local y la migra automáticamente.

**Ventajas**:
- ✅ Total independencia entre archivos
- ✅ Compatible con buckets sin ACL
- ✅ Debugging facilitado por logs extensivos

### 4. Respuesta

#### Éxito (200 OK)
Retorna la actividad creada y las URLs completas de las imágenes.

```json
{
    "message": "Actividad duplicada exitosamente.",
    "activity": {
        "id": 456,
        "project_id": 10,
        "tracking_id": 5,
        "name": "Instalación Eléctrica",
        "description": "Cableado fase 1",
        "location": "Piso 2",
        "horas": "4",
        "status": "programado",
        "icon": "electrical_services",
        "image": [
            "activities/550e8400-e29b-41d4-a716-446655440000.jpg"
        ],
        "comments": null,
        "fecha_creacion": "2025-06-15",
        "created_at": "2024-01-20T10:00:00.000000Z",
        "updated_at": "2024-01-20T10:00:00.000000Z",
        "image_urls": [
            "https://villding.s3.us-east-2.amazonaws.com/activities/550e8400-e29b-41d4-a716-446655440000.jpg"
        ]
    },
    "image_paths": [
        "https://villding.s3.us-east-2.amazonaws.com/activities/550e8400-e29b-41d4-a716-446655440000.jpg"
    ],
    "image_urls": [
        "https://villding.s3.us-east-2.amazonaws.com/activities/550e8400-e29b-41d4-a716-446655440000.jpg"
    ]
}
```

**Campos de imágenes en la respuesta**:
- `activity.image`: Array de paths relativos (`["activities/uuid.jpg"]`)
- `activity.image_urls`: URLs completas (accessor del modelo) ⭐ **Usar este**
- `image_paths`: URLs completas formateadas
- `image_urls`: URLs completas (mismo que activity.image_urls)

#### Errores Comunes

**422 Unprocessable Entity** (Validación fallida)
```json
{
    "message": "The new date field is required.",
    "errors": {
        "new_date": ["The new date field is required."]
    }
}
```

**404 Not Found** (Actividad no encontrada)
```json
{
    "message": "No query results for model [App\\Models\\Activity] 999"
}
```

**500 Internal Server Error** (Error en servidor/S3)
```json
{
    "message": "Error al duplicar actividad",
    "error": "Error message details..."
}
```

**Errores específicos de S3**:
- `"Unable to write file at location"` → Verifica permisos IAM (`s3:PutObject`)
- `"Access Denied"` → Usuario IAM sin permisos en el bucket
- `"The specified key does not exist"` → Imagen original no existe en S3

## Implementación en Frontend

### Ejemplo de Request

```javascript
async function duplicarActividad(activityId, newDate) {
  try {
    const response = await fetch('/endpoint/activities/duplicate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        activity_id: activityId,
        new_date: newDate  // Formato: 'YYYY-MM-DD'
      })
    });

    if (!response.ok) {
      throw new Error('Error al duplicar actividad');
    }

    const data = await response.json();

    // Usar las URLs de imágenes directamente
    const imageUrls = data.image_urls; // o data.activity.image_urls
    console.log('Actividad duplicada:', data.activity);
    console.log('Imágenes:', imageUrls);

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### UI/UX Sugerido

1. **Botón Duplicar**: Agregar una opción "Duplicar" en el menú de la tarjeta de actividad.
2. **Modal de Fecha**: Al hacer clic, mostrar un selector de fecha (Datepicker).
3. **Confirmación**: Al seleccionar la fecha y confirmar, llamar a este endpoint.
4. **Actualización UI**:
   - Si la fecha seleccionada es la misma que se está viendo, recargar la lista o agregar la nueva actividad al DOM.
   - Si es otra fecha, mostrar un mensaje de éxito indicando que se creó para tal fecha.
5. **Mostrar Imágenes**:
   ```javascript
   response.data.image_urls.forEach(url => {
     // <img src={url} alt="Activity" />
   });
   ```

## 🐛 Debugging y Troubleshooting

### Verificar Logs

```bash
# Ver logs en tiempo real (Windows)
tail -f storage/logs/laravel.log

# Buscar duplicaciones
findstr "duplicación" storage/logs/laravel.log

# Ver solo imágenes duplicadas exitosamente
findstr "Imagen duplicada exitosamente" storage/logs/laravel.log
```

### Logs Esperados (Éxito)

```
[timestamp] local.INFO: Iniciando duplicación de actividad ID: 123
[timestamp] local.INFO: Imágenes de la actividad fuente: ["activities/abc.jpg"]
[timestamp] local.INFO: Intentando copiar imagen: activities/abc.jpg
[timestamp] local.INFO: Imagen encontrada en S3: activities/abc.jpg
[timestamp] local.INFO: Contenido descargado, tamaño: 251587 bytes
[timestamp] local.INFO: Subiendo imagen a: activities/new-uuid.jpg
[timestamp] local.INFO: Imagen subida exitosamente
[timestamp] local.INFO: ✓ Imagen duplicada exitosamente a: activities/new-uuid.jpg
[timestamp] local.INFO: URL de la nueva imagen: https://villding.s3...
[timestamp] local.INFO: Total de imágenes copiadas: 1
```

### Script de Prueba

Ejecuta el script de prueba para verificar configuración:

```bash
cd D:\Code\villdingBackend
php test_duplicate.php
```

Verifica:
- ✓ Conexión a S3
- ✓ Descarga de imágenes existentes
- ✓ Subida de nuevas imágenes
- ✓ URLs funcionan correctamente

### Problemas Comunes

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Actividad duplicada sin imágenes | Permisos S3 | Verificar IAM: `s3:GetObject`, `s3:PutObject` |
| "Unable to write file" | Permisos incorrectos | Ver `S3_BUCKET_CONFIG.md` |
| Imágenes no se ven en app | Bucket no público | Configurar Bucket Policy |
| "Imagen no encontrada en S3" | Path incorrecto | Verificar actividad original |

### Verificar Configuración S3

**Permisos IAM** (credenciales en `.env`):
```json
{
  "Action": ["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
  "Resource": ["arn:aws:s3:::villding/*"]
}
```

**Bucket Policy** (acceso público de lectura):
```json
{
  "Action": "s3:GetObject",
  "Principal": "*",
  "Resource": "arn:aws:s3:::villding/*"
}
```

**Probar acceso**:
1. Copia una URL de los logs
2. Ábrela en el navegador
3. Si ves "Access Denied", falta Bucket Policy

## 📚 Referencias

- **`S3_BUCKET_CONFIG.md`** - Guía completa de configuración del bucket
- **`test_duplicate.php`** - Script de prueba
- **`ActivityController.php:529`** - Implementación del endpoint
- **`Activity.php:49`** - Accessor `image_urls`
