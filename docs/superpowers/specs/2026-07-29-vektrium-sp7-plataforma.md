# VEKTRIUM SP-7 — Archivos, auditoría, papelera, notificaciones y búsqueda

**Fecha:** 2026-07-29 · **Estado:** Borrador — sujeto a revisión tras SP-2
**Depende de:** SP-2 · **Madurez:** Media-alta — son capacidades transversales bien delimitadas

---

## 1. Objetivo

Las cinco capacidades que atraviesan todos los módulos y que no tienen sentido construir por
partes. Ninguna es glamorosa; todas se echan de menos el día que faltan.

---

## 2. Archivos y versionado

### `files`

`owner_entity` (`client`, `project`, `task`, `meeting`, `minute`, `deliverable`), `owner_id`,
`category`, `name`, `storage_path`, `mime_type`, `size_bytes`, `version`, `previous_version_id`,
`uploaded_by`, `checksum`.

**Categorías:** contrato, propuesta, minuta, requerimiento, diseño, datos, entregable, evidencia,
capacitación, soporte.

### Reglas

**Las rutas de almacenamiento nunca se exponen.** Toda descarga pasa por un endpoint propio que
verifica permisos y emite una URL firmada de corta duración. Exponer la ruta de Supabase Storage
convierte el permiso en decorativo.

**Versionado por encadenamiento**, no por sobrescritura: subir un archivo con el mismo nombre crea
una versión nueva que apunta a la anterior. Nada se pierde.

**Validación de subida:** lista blanca de tipos MIME, límite de tamaño, y verificación de que el
tipo declarado coincide con la firma real del archivo. Sin esto, la extensión es una sugerencia.

**Registro de descargas** para archivos marcados como sensibles.

**Enlaces compartidos con vencimiento obligatorio.** No existe la opción «sin vencimiento».

---

## 3. Auditoría completa

SP-0 dejó la tabla y la escritura transaccional. SP-7 añade la **cara visible**: pantalla de
auditoría filtrable por usuario, entidad, acción y rango de fecha, con vista de diferencias entre
`before` y `after`.

Se amplía la cobertura a cambios de permisos, sincronizaciones con Google, accesos a archivos
sensibles y restauraciones desde papelera.

**Retención:** los registros de auditoría no se borran. Si el volumen llegara a molestar — algo que
con dos fundadores no ocurrirá en años — se archivan, no se eliminan.

---

## 4. Papelera y restauración

Ya existe `deleted_at` desde SP-1. SP-7 añade la pantalla: listado de lo eliminado, tiempo restante
de retención, restauración con un clic, y purga manual restringida a `FOUNDER_ADMIN`.

**La eliminación permanente exige escribir el nombre del proyecto** y muestra antes, de forma
explícita, qué datos se pierden y cuáles se conservan. Un diálogo de «¿Estás seguro?» no es una
confirmación reforzada.

Purga automática al vencer `TRASH_RETENTION_DAYS` (30 por defecto), con aviso siete días antes.

---

## 5. Notificaciones

### `notifications`

`user_id`, `kind`, `entity`, `entity_id`, `title`, `body`, `read_at`, `created_at`, `group_key`.

**Tipos:** tareas próximas y vencidas, cambios de responsable, reuniones próximas y reprogramadas,
comentarios y menciones, propuestas sin seguimiento, entregables pendientes de aprobación y fallos
de integración.

### Reglas contra el ruido

**Agrupación por `group_key`.** Cinco tareas vencidas del mismo proyecto producen una notificación,
no cinco. Es la diferencia entre un centro de notificaciones útil y uno que se silencia a la semana.

**Digest diario o semanal configurable**, y preferencias por canal (en la app, correo).

**Nunca se notifica a alguien de su propia acción.**

---

## 6. Búsqueda global

Postgres full-text search con configuración en español, sobre proyectos, códigos, clientes,
contactos, tareas, minutas, requerimientos, entregables y archivos.

**Los permisos se aplican en la consulta, no al pintar los resultados.** Un resultado filtrado
después de recuperarlo ya filtró información: el propio recuento revela existencia. La sección 27
del prompt lo exige y la implementación lo respeta uniendo contra `project_members` dentro del SQL.

Sin motor externo de búsqueda. Postgres cubre este volumen con holgura y evita otro servicio que
mantener y sincronizar.

---

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| Archivo malicioso subido | Lista blanca MIME + verificación de firma + límite de tamaño |
| Enlace compartido filtrado | Vencimiento obligatorio, revocación, registro de accesos |
| Notificaciones excesivas llevan a silenciarlas | Agrupación por `group_key` + digest configurable |
| Búsqueda revela existencia de recursos ajenos | Permisos dentro de la consulta SQL, nunca en el post-filtrado |
| Cuota de 1 GB de Supabase Storage en tier gratuito | Monitoreo de uso; los archivos grandes son el primer motivo real para pasar a plan de pago |
