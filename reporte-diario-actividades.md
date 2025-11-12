# Reporte Diario de Actividades — Documentación

Este documento describe el flujo para generar el reporte diario de actividades en PDF, cubriendo la ruta HTTP, el controlador `generateDailyReport`, y la vista Blade que compone el reporte.

## Referencias

- `d:\Code\villdingBackend\resources\views\reports\daily-activity-report.blade.php`
- `/d:/Code/villdingBackend/app/Http/Controllers/Trackings/TrackingController.php#L398-398`
- `/d:/Code/villdingBackend/routes/web.php#L171-171`

## Ruta HTTP

- **Método**: `POST`
- **URL**: `/endpoint/tracking/report/daily/{tracking_id}`
- **Parámetros de ruta**:
  - `tracking_id` (int): ID del seguimiento del proyecto.
- **Body (JSON)**:
  - `date` (string, requerido): Fecha del reporte en formato `Y-m-d` (por ejemplo, `2025-10-20`).
- **Ejemplo cURL**:

```bash
curl -X POST \
  "http://localhost/endpoint/tracking/report/daily/123" \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-10-20"}' \
  --output reporte_diario.pdf
```

- **Respuestas**:
  - `200 OK` — Descarga de un archivo `application/pdf` con nombre: `reporte_diario_<Proyecto>_<YYYY-MM-DD>.pdf`.
  - `404 Not Found` — Si el `tracking_id` no existe.
  - `422 Unprocessable Entity` — Errores de validación de `date` (generados por `Request::validate`).
  - `500 Internal Server Error` — Error inesperado al generar el reporte (incluye trazas en modo `app.debug`).

- **Definición de ruta (web.php)**:

```php
Route::post('/endpoint/tracking/report/daily/{tracking_id}', [TrackingController::class, 'generateDailyReport']);
```

## Controlador: `TrackingController::generateDailyReport`

Firma:

```php
public function generateDailyReport(Request $request, $tracking_id)
```

Flujo del método:

1. **Validación** del cuerpo de la solicitud:
   - `date` requerido, `date`, `date_format:Y-m-d`.
2. **Cargas y consultas**:
   - Busca el `Tracking` por `id` con relaciones `project.type` y `project.subtype`.
   - Obtiene `Activity` del día (`whereDate('fecha_creacion', $reportDate)`), ordenadas por `created_at ASC`.
3. **Cálculo del número de semana**:
   - Basado en `tracking.date_start` y la `date` del reporte: `diffInWeeks(...) + 1`.
   - Se envía a la vista como `weekNumber` con `str_pad(..., 3, '0')`.
4. **Formateo de fecha legible** (`formattedDate`):
   - Intenta `Carbon::locale('es')->isoFormat('dddd, D [de] MMMM [de] YYYY')`.
   - Fallback manual en español si el locale no está disponible.
5. **Preparación de datos para la vista**:
   - `tracking`, `project` (de `tracking->project`), `activities`, `reportDate`, `formattedDate`, `weekNumber`.
6. **Generación del PDF** con `Barryvdh\DomPDF\Facade\Pdf`:
   - Vista: `reports.daily-activity-report`.
   - Papel A4, orientación `portrait`.
   - Opciones: `isHtml5ParserEnabled`, `isRemoteEnabled`, `chroot` (`storage/app/public`, `public`), `enable_remote`, `defaultFont` = `Helvetica`.
   - Timeout HTTP para recursos remotos: 30 segundos.
7. **Respuesta**: descarga (`$pdf->download($fileName)`).
8. **Manejo de errores**:
   - `ModelNotFoundException` → 404 JSON.
   - `Exception` genérica → 500 JSON con mensaje y, si `app.debug`, detalles.

### Datos enviados a la vista

```php
$data = [
  'tracking'      => $tracking,
  'project'       => $tracking->project,
  'activities'    => $activities,
  'reportDate'    => $reportDate,
  'formattedDate' => $formattedDate,
  'weekNumber'    => str_pad($weekNumber, 3, '0', STR_PAD_LEFT),
];
```

## Vista Blade: `resources/views/reports/daily-activity-report.blade.php`

Propósito: Plantilla HTML del reporte diario, diseñada para renderizarse como PDF.

Variables esperadas:

- `project`: Proyecto del tracking (usado para nombre e imagen `project->uri`).
- `tracking`: Seguimiento (`title`, `date_start`).
- `activities`: Colección de `Activity` del día.
- `formattedDate`: Fecha legible en español.
- `weekNumber`: Número de semana (padded a 3 dígitos).

Estructura principal:

- **Portada**:
  - Título: “REPORTE DE SEGUIMIENTO DE ACTIVIDADES”.
  - Imagen del proyecto si `project->uri` está presente.
  - Nombre del proyecto (en mayúsculas).
  - Pie con: `Seguimiento`, `Fecha`, `Semana`.
- **Páginas de contenido**:
  - Cabecera con `project->name | formattedDate`.
  - Título centrado con `tracking->title` (en mayúsculas).
  - Tarjetas de actividad (rediseñadas) con detalles y galería.
  - Pie con paginación: “Página X de N”.

Paginación de actividades:

- Se define `activitiesPerPage = 2` y se usa `chunk(activitiesPerPage)` para partir en páginas.
- Cada página incluye hasta dos tarjetas.

Tarjeta de actividad:

- **Encabezado**: nombre (`activity->name`) y estado (`activity->status`) con estilos.
- **Detalles**: `description`, `location` (opcional), `comments` (opcional), `horas`.
- **Galería**:
  - Grid 2x2 (`array_slice($imageUrls, 0, 4)`).
  - Si no hay imágenes: placeholder “Sin Imágenes”.

Estados con estilos:

- `completado` → verde.
- `programado` → amarillo.
- `pendiente` → rojo.

## Modelo `Activity` y `image_urls`

El modelo `Activity` define:

- `image` como arreglo (`casts = ['image' => 'array']`).
- Atributo calculado `image_urls` (`appends`), que transforma cada entrada de `image` a una URL accesible:
  - Comienza con `http://` o `https://` → se usa tal cual.
  - Comienza con `images/activities/` → se resuelve con `asset(...)`.
  - Contiene `/` (ruta con subcarpetas) → `Storage::disk('s3')->url($path)`.
  - En caso contrario → `asset('images/activities/<nombre>')`.

La vista usa `{{ $activity->image_urls }}` para poblar la galería.

## Cálculo del número de semana

- Se calcula desde `tracking.date_start` hasta `date` del reporte:
  - `diffInWeeks` entre ambas fechas + 1.
- Se representa con tres dígitos (`001`, `002`, …) mediante `str_pad`.

## Requisitos y configuración

- Paquete `barryvdh/laravel-dompdf` instalado y configurado.
- `isRemoteEnabled` y `enable_remote` activos para cargar imágenes externas.
- `chroot` configurado a `storage/app/public` y `public`.
- Fuente por defecto: `Helvetica`.
- Límite de ejecución y memoria aumentados para generación de PDF.

## Consideraciones y buenas prácticas

- Validar siempre `date` en formato `Y-m-d` en el cliente.
- Asegurar que `tracking.date_start` esté correctamente poblado para el cálculo de semana.
- Optimizar el tamaño de imágenes para evitar sobrecarga de DOMPDF.
- Si usas S3, verifica permisos públicos o URLs presignadas para visualizar las imágenes.

## Ejemplo de uso (end-to-end)

1. Crear actividades para un `tracking_id` en una fecha dada (`fecha_creacion = YYYY-MM-DD`).
2. Invocar la ruta `POST /endpoint/tracking/report/daily/{tracking_id}` con `{"date":"YYYY-MM-DD"}`.
3. Recibir y descargar el PDF resultante.