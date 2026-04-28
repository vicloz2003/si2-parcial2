# AsisteCar - Instrucciones del Proyecto

## Contexto Del Proyecto

AsisteCar es una plataforma de auxilio mecanico vehicular. El problema central es conectar a conductores que sufren un percance, falla mecanica o accidente con talleres y mecanicos capaces de prestar asistencia.

El sistema debe permitir que una persona reporte su situacion desde una aplicacion movil y que talleres mecanicos reciban, evaluen y gestionen esas solicitudes desde una aplicacion web.

## Plataformas Y Separacion Por Rol

- Backend: API en Python con FastAPI.
- Base de datos: PostgreSQL.
- Web: Angular solo para administradores de talleres y administradores de plataforma AsisteCar.
- Movil: app para clientes/conductores y tecnicos/mecanicos. El requerimiento academico indica React Native para clientes/conductores; el repositorio actual contiene una app movil en Flutter, asi que se debe continuar en Flutter salvo que el usuario pida explicitamente una migracion.
- Despliegue esperado: AWS o Microsoft Azure.

La separacion correcta de producto es:

- Cliente/conductor: usa la app movil para reportar emergencias, enviar ubicacion, audio, fotos, recibir ofertas, seguir el servicio y calificar.
- Tecnico/mecanico: usa la app movil para ver trabajos asignados, compartir ubicacion GPS, abrir rutas, cambiar estados del servicio y subir evidencias de atencion.
- Taller/admin de taller: usa la web Angular para gestionar solicitudes, ofertas, tecnicos, asignaciones, pagos, historial y reportes operativos.
- Admin plataforma AsisteCar: usa la web Angular para administrar usuarios, talleres, incidentes, comisiones, reportes y monitoreo general.

No crear paneles web para clientes o tecnicos como solucion principal. Si existe alguna vista web temporal para pruebas, no debe tratarse como experiencia final del producto.

## Flujo Funcional Principal

1. El conductor reporta un incidente desde la app movil.
2. El reporte puede incluir texto, audio, fotografias y coordenadas de ubicacion.
3. El backend procesa la informacion y consume una API de inteligencia artificial.
4. La IA debe analizar texto, transcripcion de audio, imagenes y ubicacion para clasificar el problema.
5. La IA debe sugerir una solucion y un costo aproximado del servicio.
6. El sistema notifica a talleres pertinentes segun cercania y tipo de servicio requerido.
7. Los talleres reciben la alerta en la web, revisan el caso y deciden si aceptan el trabajo.
8. Si aceptan, envian una oferta al cliente.
9. El cliente compara ofertas por distancia, caracteristicas del taller, calificaciones y costo sugerido.
10. El cliente selecciona la oferta mas conveniente.

## Dominio Y Entidades Clave

- Cliente/conductor: usuario que registra vehiculos y solicita auxilio.
- Taller: negocio que atiende emergencias vehiculares.
- Administrador de taller: gestiona solicitudes, tecnicos, funcionarios, disponibilidad y servicios.
- Tecnico/mecanico: persona asignada a un incidente.
- Vehiculo: automovil del cliente afectado por el incidente.
- Incidente: solicitud de auxilio con categoria, prioridad, estado, ubicacion, evidencias y costos.
- Evidencia: texto, audio, imagenes, transcripciones y analisis de IA.
- Oferta: respuesta del taller con costo, distancia, disponibilidad y condiciones.
- Pago/comision: registro economico del servicio y comision de plataforma.
- Calificacion/review: valoracion del cliente al taller tras completar el servicio.

## Funcionalidades Esperadas

### App Movil Para Clientes

- Registrar e iniciar sesion como cliente.
- Registrar vehiculos.
- Crear reportes de incidente con texto, audio, fotos y ubicacion GPS.
- Ver diagnostico/categoria sugerida por IA.
- Recibir ofertas de talleres.
- Comparar talleres por distancia, calificacion, caracteristicas y costo.
- Seleccionar una oferta.
- Seguir el estado del servicio.
- Calificar el taller al finalizar.

### App Movil Para Tecnicos

- Iniciar sesion como tecnico asociado a un taller.
- Ver trabajos asignados por el taller.
- Compartir ubicacion GPS durante la atencion.
- Abrir o consultar ruta hacia el incidente.
- Cambiar estado del trabajo: en camino, en progreso, completado.
- Subir evidencias finales, fotos, notas o reporte de servicio cuando se implemente.
- Comunicarse con cliente o taller cuando exista chat asociado.

### App Web Para Talleres

- Registrar e iniciar sesion como taller.
- Ver alertas de incidentes cercanos y compatibles con sus servicios.
- Aceptar o rechazar solicitudes.
- Enviar ofertas de servicio.
- Gestionar tecnicos, mecanicos y funcionarios propios.
- Asignar tecnicos a servicios aceptados.
- Actualizar estados del incidente.
- Registrar costos finales, pagos y comisiones.
- Consultar historial, reportes y rendimiento operativo.

### App Web Para Administradores De Plataforma

- Gestionar usuarios de todos los roles.
- Gestionar talleres registrados y su disponibilidad.
- Monitorear incidentes, asignaciones, pagos y comisiones.
- Consultar reportes globales de operacion.
- Separar claramente opciones de plataforma de opciones internas del taller.

### Backend

- Exponer API REST con FastAPI.
- Usar PostgreSQL con SQLAlchemy.
- Mantener autenticacion por JWT.
- Hashear contrasenas antes de guardarlas.
- Coordinar clasificacion IA, asignacion, notificaciones, pagos, chat y evidencia.
- Mantener datos consistentes entre clientes, talleres, vehiculos, incidentes y tecnicos.

## Reglas Tecnicas Del Repositorio

- Mantener cambios pequenos y coherentes con la estructura actual.
- Backend vive en `backend/`.
- Frontend Angular vive en `frontend/`.
- App movil actual vive en `mobile/`.
- No introducir otro framework web o backend si no es necesario.
- Preferir patrones ya existentes del repositorio antes de crear abstracciones nuevas.
- No guardar contrasenas en texto plano; usar las utilidades de seguridad del backend.
- Mantener controles de rol tambien en backend; no depender solo de ocultar opciones en frontend.
- En Angular, permitir acceso operativo solo a roles `admin` y `workshop`.
- En Flutter, soportar roles `client` y `technician` como experiencias moviles.
- Los endpoints de tecnicos pertenecen al backend y deben consumirse desde `mobile/`, no desde el panel web como flujo principal.
- Para seed/demo local, la contrasena solicitada para usuarios demo es `12345678*` y debe guardarse hasheada.
- La base de datos local se configura con `backend/.env` y `DATABASE_URL`.

## Criterios De Producto

- El foco del producto es la coordinacion rapida de auxilio mecanico.
- La experiencia del taller debe ser operativa, clara y orientada a gestion diaria.
- La experiencia del cliente debe priorizar reporte rapido, ubicacion, confianza y comparacion de ofertas.
- La experiencia del tecnico debe priorizar movilidad, ubicacion en tiempo real, claridad de trabajo asignado y acciones rapidas en campo.
- La experiencia del administrador de plataforma debe priorizar supervision, control y metricas generales, no herramientas internas de un taller.
- Las pantallas no deben sentirse como landing generica cuando correspondan a herramientas de trabajo.
- La landing publica debe explicar el valor para talleres y llevar a registro/login.
- La UI debe soportar modo claro y oscuro cuando se trabaje en superficies publicas o de panel.

## Metodologia Del Examen

- Usar Proceso Unificado de Desarrollo como metodologia.
- El trabajo academico es para grupos de 2 personas.
- El tiempo de desarrollo indicado es de 4 semanas.
- La aplicacion web debe incluir gestion interna del taller, no solo recepcion de alertas.

## Comandos Utiles

Backend local:

```bash
cd backend
.venv/Scripts/python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Seed local:

```bash
cd backend
.venv/Scripts/python.exe seed.py
```

Frontend Angular:

```bash
cd frontend
npm start
```

Build frontend:

```bash
cd frontend
npm run build
```

Movil actual del repositorio:

```bash
cd mobile
flutter pub get
```
