# VEKTRIUM SP-3 — Google Calendar y Meet en producción

**Fecha:** 2026-07-29 · **Estado:** Borrador aprobado para planificación tras SP-1
**Depende de:** SP-1 · **Madurez:** Alta — el diseño es firme; solo espera credenciales
**Bloqueado por:** un prerrequisito humano, no técnico

---

## 1. Objetivo

Sustituir el `MockProvider` de SP-1 por `GoogleProvider`, sin tocar ninguna pantalla. Si SP-1 se
construyó bien, este sub-proyecto no modifica un solo componente de interfaz: implementa una
interfaz que ya existe y cambia qué implementación se inyecta.

---

## 2. Prerrequisito humano bloqueante

Nada de esto puede empezar sin:

1. Dominio en **Google Workspace** (o, en su defecto, cuentas Gmail con la app en modo *testing*,
   limitada a 100 usuarios de prueba y con advertencia de app no verificada).
2. Proyecto en **Google Cloud Console** con la API de Calendar habilitada.
3. **Pantalla de consentimiento OAuth** configurada.
4. Credenciales de cliente OAuth de tipo *aplicación web* con las URI de redirección registradas.

**Decisión:** si al llegar aquí siguen sin existir, SP-3 se salta y se pasa a SP-4. El mock es
funcional y está etiquetado; el portal sirve sin Google. Lo que no se hará es esperar bloqueados.

---

## 3. Scopes solicitados

Únicamente `https://www.googleapis.com/auth/calendar.events`.

Se descarta `calendar` completo: permite borrar calendarios enteros y no hace falta. Se descarta
`calendar.readonly` por separado: el scope de eventos ya incluye lectura. Pedir de menos acelera
además la verificación de la app ante Google.

---

## 4. Diseño de la integración

### Creación de eventos con Meet

Un evento por reunión, con conferencia generada mediante `conferenceData.createRequest` y un
`requestId` nuevo, enviando `conferenceDataVersion=1`.

**Idempotencia.** El `request_id` ya existe en `meetings` desde SP-1. El flujo es: generar y
persistir `request_id` **antes** de llamar a Google; si la llamada falla o expira, el reintento
reutiliza el mismo `request_id`, y Google devuelve la conferencia ya creada en lugar de una nueva.
La restricción `UNIQUE (provider, provider_event_id)` es la última línea de defensa. Esto es lo que
hace cierta la regla 13 del prompt.

### Sincronización incremental

Nueva tabla `calendar_sync_state`: `connection_id`, `sync_token`, `last_full_sync_at`,
`last_incremental_at`, `failure_count`.

Se usa `syncToken` de la API de Calendar. Cuando Google lo invalida (responde 410 GONE), se hace
una resincronización completa y se guarda un token nuevo. **`failure_count` importa**: tras tres
fallos consecutivos la conexión pasa a `expirada` y se notifica al usuario, en vez de reintentar en
silencio para siempre.

### Almacenamiento de tokens

El refresh token se cifra con AES-256-GCM usando `CALENDAR_TOKEN_ENCRYPTION_KEY`, jamás se envía al
cliente y jamás aparece en logs. La política RLS de `calendar_connections` ya lo restringe a su
propietario desde SP-0.

**Revocación:** el usuario puede desconectar Google desde su perfil. Eso llama al endpoint de
revocación de Google, borra el token cifrado y marca la conexión como `revocada`. Las reuniones ya
creadas se conservan con su `provider_event_id`; simplemente dejan de sincronizarse.

---

## 5. Manejo de errores

| Situación | Comportamiento |
|---|---|
| Token expirado | Refresco automático transparente |
| Refresh token inválido | Conexión a `expirada`, aviso al usuario, acción «Reconectar» |
| Cuota de API excedida | Reintento con retroceso exponencial, máximo 3 intentos |
| Conflicto de horario detectado | Se avisa antes de crear, no se bloquea |
| Evento borrado desde Google | La reunión queda `desincronizada` con acción de recrear |

Ninguno de estos casos falla en silencio. Todos son visibles en la ficha de la reunión.

---

## 6. Página pública de reserva

Alcance del prompt en su sección 10. Se incluye aquí porque comparte toda la maquinaria.

- El prospecto elige tipo de reunión y ve **solo huecos libres**, nunca detalles de otros eventos.
- Se capturan nombre, empresa, correo, teléfono opcional, necesidad y consentimiento explícito.
- Protección contra abuso: límite por IP y por correo, más una comprobación de tiempo mínimo de
  cumplimentación. **Sin CAPTCHA** en la primera versión — añade fricción a un formulario de
  captación de leads y el volumen no justifica el costo de conversión.
- Al confirmar se crean lead, contacto, reunión y evento de Google en una sola transacción lógica.

---

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| Verificación de la app por Google tarda semanas | Modo *testing* cubre a dos fundadores desde el día uno |
| Eventos duplicados por reintentos | `request_id` persistido antes de la llamada + restricción única |
| Fuga del refresh token | Cifrado en reposo, RLS, nunca en cliente ni en logs |
| `syncToken` invalidado con frecuencia | Resincronización completa automática ante 410 |
| La reserva pública atrae spam | Límites por IP y correo; se revisa si aparece abuso real |
