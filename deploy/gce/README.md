# Despliegue de AsisteCar en Google Compute Engine

Esta configuracion despliega AsisteCar en una VM de Compute Engine usando Docker Compose:

- `frontend`: Angular compilado y servido con Nginx.
- `backend`: FastAPI en Uvicorn.
- `db`: PostgreSQL 16 con volumen persistente.
- `caddy`: proxy publico con HTTPS automatico para `asistecar.net` y `www.asistecar.net`.

El proyecto GCP usado es `asistecar`.

Estado actual del despliegue:

- VM: `asistecar-vm`
- Zona: `us-central1-a`
- IP estatica: `34.136.223.87`
- Dominio previsto: `asistecar.net` y `www.asistecar.net`

## 1. Preparar Google Cloud

```bash
gcloud config set project asistecar
gcloud services enable compute.googleapis.com iam.googleapis.com aiplatform.googleapis.com
```

Crear una cuenta de servicio para la VM. Esta cuenta permite que el backend use Vertex AI/Gemini desde Compute Engine sin guardar llaves dentro del contenedor.

```bash
gcloud iam service-accounts create asistecar-gce \
  --display-name="AsisteCar Compute Engine"

gcloud projects add-iam-policy-binding asistecar \
  --member="serviceAccount:asistecar-gce@asistecar.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

Crear la VM. Puedes cambiar la zona si lo necesitas, pero usa la misma zona en los secretos de GitHub.

```bash
gcloud compute instances create asistecar-vm \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --boot-disk-size=30GB \
  --tags=asistecar-http \
  --service-account=asistecar-gce@asistecar.iam.gserviceaccount.com \
  --scopes=https://www.googleapis.com/auth/cloud-platform
```

Abrir HTTP y HTTPS publicos:

```bash
gcloud compute firewall-rules create asistecar-allow-http \
  --allow=tcp:80 \
  --target-tags=asistecar-http \
  --description="Allow HTTP traffic to AsisteCar"

gcloud compute firewall-rules create asistecar-allow-https \
  --allow=tcp:443 \
  --target-tags=asistecar-http \
  --description="Allow HTTPS traffic to AsisteCar"
```

Reservar la IP publica como estatica para que el dominio no cambie si la VM se reinicia:

```bash
gcloud compute addresses create asistecar-ip \
  --region=us-central1 \
  --addresses=34.136.223.87
```

Instalar Docker en la VM:

```bash
gcloud compute scp deploy/gce/bootstrap-vm.sh asistecar-vm:/tmp/bootstrap-vm.sh --zone=us-central1-a
gcloud compute ssh asistecar-vm --zone=us-central1-a --command="bash /tmp/bootstrap-vm.sh"
```

## 2. Preparar GitHub Actions

Crear una cuenta de servicio para el despliegue desde GitHub Actions:

```bash
gcloud iam service-accounts create github-actions-deploy \
  --display-name="GitHub Actions Deploy"

gcloud projects add-iam-policy-binding asistecar \
  --member="serviceAccount:github-actions-deploy@asistecar.iam.gserviceaccount.com" \
  --role="roles/compute.instanceAdmin.v1"

gcloud projects add-iam-policy-binding asistecar \
  --member="serviceAccount:github-actions-deploy@asistecar.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

Crear una llave JSON para GitHub Actions:

```bash
gcloud iam service-accounts keys create gcp-sa-key.json \
  --iam-account=github-actions-deploy@asistecar.iam.gserviceaccount.com
```

En GitHub, agrega estos secretos en `Settings > Secrets and variables > Actions`:

| Nombre | Valor |
| --- | --- |
| `GCP_SA_KEY` | Contenido completo de `gcp-sa-key.json` |
| `GCE_INSTANCE` | `asistecar-vm` |
| `GCE_ZONE` | `us-central1-a` |
| `POSTGRES_PASSWORD` | Password fuerte para PostgreSQL |
| `SECRET_KEY` | Clave larga para firmar JWT |

Variables opcionales de GitHub Actions:

| Nombre | Valor recomendado |
| --- | --- |
| `GOOGLE_CLOUD_LOCATION` | `us-central1` |
| `GEMINI_MODEL` | `gemini-2.5-flash` |

En este repositorio ya se configuraron con GitHub CLI los secrets `GCP_SA_KEY`, `GCE_INSTANCE`, `GCE_ZONE`, `POSTGRES_PASSWORD`, `SECRET_KEY` y las variables `GOOGLE_CLOUD_LOCATION`, `GEMINI_MODEL`.

## 3. Ejecutar despliegue

El workflow esta en `.github/workflows/deploy-gce.yml`.

Se ejecuta automaticamente con push a `main` cuando cambian backend, frontend, despliegue o compose. Tambien puedes ejecutarlo manualmente desde `Actions > Deploy to Google Compute Engine > Run workflow`.

Al terminar, revisa la IP externa:

```bash
gcloud compute instances describe asistecar-vm \
  --zone=us-central1-a \
  --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
```

La web queda disponible en:

```text
http://IP_EXTERNA
```

La API queda disponible en:

```text
http://IP_EXTERNA/api
http://IP_EXTERNA/docs
```

## 4. Configurar dominio en DonDominio

El dominio comprado es `asistecar.net` y debe apuntar a la IP estatica de Compute Engine `34.136.223.87`.

En la zona DNS de DonDominio, reemplaza los registros de parking por estos registros:

| Host | Tipo | Valor |
| --- | --- | --- |
| `asistecar.net` | `A` | `34.136.223.87` |
| `www.asistecar.net` | `CNAME` | `asistecar.net.` |

Elimina o reemplaza estos registros actuales de parking:

| Host | Tipo | Valor actual |
| --- | --- | --- |
| `asistecar.net` | `ANAME` | `parkingsrv0.dondominio.com` |
| `*.asistecar.net` | `CNAME` | `parkingsrv0.dondominio.com.` |
| `www.asistecar.net` | `CNAME` | `parkingsrv0.dondominio.com.` |

Mantén los registros de correo (`mail`, `smtp`, `imap`, `pop`, `webmail`) si vas a usar el correo de DonDominio.

Despues de la propagacion DNS, la web queda disponible con HTTPS automatico:

```text
https://asistecar.net
https://www.asistecar.net
```

## 5. Comandos utiles en la VM

```bash
cd /opt/asistecar
sudo docker compose --env-file .env.production -f docker-compose.prod.yml ps
sudo docker compose --env-file .env.production -f docker-compose.prod.yml logs -f backend
sudo docker compose --env-file .env.production -f docker-compose.prod.yml logs -f frontend
sudo docker compose --env-file .env.production -f docker-compose.prod.yml logs -f caddy
sudo docker compose --env-file .env.production -f docker-compose.prod.yml logs -f db
```

Para ejecutar el seed demo en produccion:

```bash
cd /opt/asistecar
sudo docker compose --env-file .env.production -f docker-compose.prod.yml exec backend python seed.py
```
