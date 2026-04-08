# EmergenciApp — Plataforma Inteligente de Emergencias Vehiculares

Plataforma que conecta usuarios con talleres mecánicos mediante análisis automatizado de incidentes con IA (imagen, audio, texto y geolocalización).

## Requisitos Previos

| Herramienta | Versión mínima |
|-------------|---------------|
| Python | 3.12 |
| Node.js | 20+ |
| npm | 10+ |
| Flutter SDK | 3.10+ |
| PostgreSQL | 16 |
| Docker (opcional) | 24+ |

---

## 1. Base de Datos (PostgreSQL)

### Opción A: Docker (recomendado)

```bash
docker compose up db -d
```

Esto levanta PostgreSQL en `localhost:5432` con:
- **DB:** `emergencias_vehiculares`
- **Usuario:** `postgres`
- **Contraseña:** `postgres`

### Opción B: PostgreSQL local

1. Instalar PostgreSQL 16.
2. Crear la base de datos:

```sql
CREATE DATABASE emergencias_vehiculares;
```

3. Ajustar credenciales en `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/emergencias_vehiculares
```

---

## 2. Backend (FastAPI)

### Configuración

1. Entrar al directorio:

```bash
cd backend
```

2. Crear entorno virtual e instalar dependencias:

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

3. Configurar el archivo `.env` en `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/emergencias_vehiculares
SECRET_KEY=tu-clave-secreta-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
OPENAI_API_KEY=sk-tu-api-key-de-openai
UPLOAD_DIR=./uploads
FIREBASE_CREDENTIALS_PATH=
```

> **Nota:** `OPENAI_API_KEY` es necesaria para los módulos de IA (transcripción de audio, análisis de imágenes, clasificación de incidentes). Sin ella, la IA no funcionará pero el resto de la app sí.

4. Crear carpetas de uploads:

```bash
mkdir -p uploads/images uploads/audio
```

### Ejecutar

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Verificar

- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health check: [http://localhost:8000/health](http://localhost:8000/health)

### Con Docker (alternativa)

```bash
# Levanta DB + Backend juntos
docker compose up -d
```

---

## 3. Frontend (Angular — Panel de Talleres)

### Configuración

1. Entrar al directorio:

```bash
cd frontend
```

2. Instalar dependencias:

```bash
npm install
```

3. Verificar que el backend corre en `localhost:8000`. La configuración de la API está en `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  wsUrl: 'ws://localhost:8000/ws',
};
```

### Ejecutar

```bash
npm start
```

o equivalente:

```bash
ng serve
```

### Verificar

- Abrir: [http://localhost:4200](http://localhost:4200)
- Registrarse como **taller** (workshop) para acceder al panel.

---

## 4. Mobile (Flutter — App del Cliente)

### Configuración

1. Entrar al directorio:

```bash
cd mobile
```

2. Instalar dependencias:

```bash
flutter pub get
```

3. **Importante — Configurar IP del backend:**

   El archivo `lib/services/api_service.dart` define la URL base:

   ```dart
   static const String baseUrl = 'http://10.0.2.2:8000/api';
   ```

   - `10.0.2.2` → apunta a `localhost` desde el **emulador Android**.
   - Si usas **dispositivo físico**, cámbialo a la IP de tu PC (ej: `192.168.1.100`).
   - Si usas **emulador iOS**, usa `localhost` directamente.

   Lo mismo aplica para el WebSocket en `lib/services/websocket_service.dart`:

   ```dart
   static const String _baseWsUrl = 'ws://10.0.2.2:8000/ws';
   ```

### Ejecutar en emulador Android

```bash
flutter run
```

### Ejecutar en Chrome (web)

```bash
flutter run -d chrome
```

### Verificar

- Registrarse como **cliente** para crear emergencias.
- Registrar un vehículo antes de poder reportar una emergencia.

---

## Flujo Completo de Prueba

1. **Levantar base de datos** → `docker compose up db -d`
2. **Levantar backend** → `cd backend && uvicorn app.main:app --reload`
3. **Levantar frontend** → `cd frontend && npm start`
4. **Levantar mobile** → `cd mobile && flutter run`

### Prueba end-to-end:

1. En la **app móvil**: registrar usuario → registrar vehículo → crear emergencia (ubicación + fotos + audio + descripción).
2. En el **panel web**: registrar como taller → crear workshop → agregar técnicos → ver incidentes pendientes → aceptar incidente → completar servicio con costo.
3. En la **app móvil**: ver el estado actualizado → realizar pago.

---

## Estructura del Proyecto

```
├── backend/            # FastAPI (Python) — API REST + WebSocket + IA
│   ├── app/
│   │   ├── ai/         # Módulos de IA (Whisper, GPT-4 Vision, clasificador)
│   │   ├── models/     # Modelos SQLAlchemy (ORM)
│   │   ├── routers/    # Endpoints de la API
│   │   ├── schemas/    # Schemas Pydantic (validación)
│   │   ├── services/   # Lógica de negocio (asignación, IA, WebSocket, push)
│   │   └── utils/      # Seguridad (JWT, bcrypt)
│   └── uploads/        # Archivos subidos (imágenes, audio)
├── frontend/           # Angular 21 — Panel web para talleres
│   └── src/app/
│       ├── components/ # Navbar
│       ├── pages/      # Dashboard, Incidents, Technicians, History
│       ├── services/   # API, Auth, WebSocket
│       └── models/     # Interfaces TypeScript
├── mobile/             # Flutter — App móvil para clientes
│   └── lib/
│       ├── screens/    # Login, Register, Home, Emergency, Detail, Vehicles
│       ├── services/   # API, WebSocket
│       ├── models/     # Modelos Dart
│       ├── widgets/    # Componentes reutilizables
│       └── theme/      # Colores y tema
└── docker-compose.yml  # Orquestación de servicios
```

---

## Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `DATABASE_URL` | Conexión a PostgreSQL | Sí |
| `SECRET_KEY` | Clave para firmar JWT | Sí |
| `OPENAI_API_KEY` | API key de OpenAI para IA | Para módulos IA |
| `FIREBASE_CREDENTIALS_PATH` | Ruta al JSON de Firebase Admin | Para push notifications |

---

## Puertos

| Servicio | Puerto |
|----------|--------|
| PostgreSQL | 5432 |
| Backend (FastAPI) | 8000 |
| Frontend (Angular) | 4200 |
