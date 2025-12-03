# Documentación: Generación de Reporte Múltiple de Actividades

Este documento describe el uso del nuevo endpoint para generar reportes consolidados de múltiples trackings en un solo archivo PDF.

## Endpoint

**URL:** `/endpoint/tracking/report/multi`  
**Método:** `POST`  
**Autenticación:** Requiere autenticación (dependiendo de la configuración de rutas, actualmente en `web.php` podría no requerir token si no está bajo middleware de auth, verificar implementación).

## Descripción

Este endpoint permite seleccionar múltiples seguimientos (trackings) con fechas específicas y generar un único reporte PDF que concatena los reportes diarios individuales. Cada reporte diario comienza en una nueva página.

## Estructura de la Petición (Request Body)

El cuerpo de la petición debe ser un objeto JSON que contenga un array llamado `report_data`. Cada elemento de este array debe especificar:

*   `tracking_id`: ID del tracking (seguimiento) a reportar.
*   `date`: Fecha del reporte en formato `YYYY-MM-DD`.

### Parámetros

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `report_data` | Array | Sí | Lista de objetos con la información de los reportes. |
| `report_data.*.tracking_id` | Integer | Sí | ID del tracking existente en la base de datos. |
| `report_data.*.date` | String | Sí | Fecha del reporte (Formato: YYYY-MM-DD). |

### Ejemplo de JSON

```json
{
    "report_data": [
        {
            "tracking_id": 12,
            "date": "2023-10-27"
        },
        {
            "tracking_id": 15,
            "date": "2023-10-28"
        },
        {
            "tracking_id": 12,
            "date": "2023-10-29"
        }
    ]
}
```

## Respuesta

*   **Éxito (200 OK):** Retorna un archivo PDF binario (`application/pdf`) descargable.
    *   El nombre del archivo tendrá el formato: `reporte_multiple_YYYY-MM-DD_HH-mm-ss.pdf`.
*   **Error de Validación (422 Unprocessable Entity):** Si faltan campos o los formatos son incorrectos.
*   **Error del Servidor (500 Internal Server Error):** Si ocurre un error durante la generación del PDF o la consulta de datos.

## Características del Reporte

1.  **Consolidación:** Combina la información de diferentes proyectos o días en un solo documento.
2.  **Saltos de Página:** Cada reporte diario (combinación tracking/fecha) se imprime en una hoja separada para mantener el orden.
3.  **Formato:** Mantiene el mismo estilo visual que el reporte diario individual (`daily-activity-report`), incluyendo:
    *   Encabezado con información del proyecto.
    *   Listado de actividades con sus estados (Completado, Pendiente, Programado).
    *   Imágenes adjuntas a las actividades.
    *   Cálculo automático de la semana del proyecto.

## Notas de Implementación

*   **Tiempos de Ejecución:** Dado que generar PDFs con imágenes puede ser pesado, el endpoint aumenta temporalmente el `max_execution_time` a 300 segundos y el `memory_limit` a 512M.
*   **Manejo de Errores:** Si un tracking ID no existe, el proceso fallará para esa petición completa. Asegúrese de enviar IDs válidos.
