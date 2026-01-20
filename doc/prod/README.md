# Desplegament Manual a Producció

## Requisits Previs

- Tenir **Docker** i **Docker Compose** instal·lats al servidor.
- El repositori ja ha d'estar clonat a la carpeta: `/tr2-reptes-tr2-grup2`.

## Pas a Pas

### 1. Accedir al Servidor

Obre el teu terminal i connecta't via SSH:

```bash
ssh usuari@ip-del-teu-servidor
```

### 2. Baixar el Codi Més Recent

Navega a la carpeta del projecte i baixa els canvis de la branca `main`:

```bash
cd /tr2-reptes-tr2-grup2
git pull origin main

```

### 3. Configuració de Variables d'Entorn (`.env`)

> [!WARNING]  
> Assegura't que els fitxers `.env` existeixen i tenen les dades correctes de producció. Si cal editar-los:

#### A. Configuració del Backend

```bash
nano back/.env

```

Exemple de contingut:

```env
PORT=8000
HOST=tr2g2-mysql
USER=root
PASSWORD=laTevaContrasenyaBBDD
DATABASE_URL=mysql://usuari:contrasenya@tr2g2-mysql:3306/GESTIO-CURSOS?charset=utf8mb4
DATABASE_USER=usuari
DATABASE_PASSWORD=contrasenya
DATABASE_NAME=GESTIO-CURSOS
DATABASE_HOST=tr2g2-mysql
DATABASE_PORT=3306

```

#### B. Configuració del Frontend

```bash
nano front/.env

```

Exemple de contingut:

```env
VITE_URL_BACK=https://latevaweb.com/api
```

#### C. Configuració SMTP (Correu)

```bash
nano back/functions/smtp/.env
```

Exemple de contingut:

```env
EMAIL_USER_SMTP=el-teu-email@domini.com
EMAIL_PASS_SMTP=la-teva-contrasenya
EMAIL_HOST_SMTP=smtp.gmail.com
EMAIL_PORT_SMTP=465
```

> [!NOTE]
> El servidor SMTP esta configurat aqui per a SMTP de Google, adaptal depenet del servei que tens

---

### 4. Configurar el nginx.conf

Assegura't que el fitxer `nginx.conf` està configurat correctament per al teu domini i les rutes del frontend i backend.

```bash
nano nginx.conf
```

### 5. Reconstruir i Aixecar Contenidors

Un cop tenim el codi nou i els fitxers `.env` preparats, hem de reconstruir les imatges de Docker perquè agafin els canvis.

Assegura't d'estar a l'arrel del projecte (`/tr2-reptes-tr2-grup2`):

```bash
docker compose -f docker-compose.prod.yml up --build -d

```

- `--build`: Força la recompilació de les imatges (necessari si has canviat codi).
- `-d`: _Detached mode_ (s'executa en segon pla).

### 6. Generacio dels certificats SSL amb Let's Encrypt

Si encara no tens els certificats SSL, pots generar-los amb Certbot:

```bash
docker compose -f docker-compose.prod.yml run --rm --entrypoint tr2-reptes-tr2-grup2-certbot-1 certbot certonly --webroot --webroot-path /var/www/certbot -d gestallers.daw.inspedralbes.cat --email [El teu correu electronic] --agree-tos --no-eff-email
```

> [!IMPORTANT]  
> Tens que tenir els contenidors aixecats per a que certbot pugui verificar el domini.

### 7. Actualitzar la Base de Dades (Prisma)

Si has fet canvis a l'esquema de la base de dades (`schema.prisma`), has d'executar les migracions dins del contenidor que acabes d'aixecar:

```bash
docker compose -f docker-compose.prod.yml exec tr2g2-back npx prisma migrate deploy

```

Si necessites reomplir la base de dades (Seed):

```bash
docker compose -f docker-compose.prod.yml exec tr2g2-back npx prisma db seed

```


> [!TIP]
>
> ### Verificació i Manteniment
>
> Comprovar que tot funciona
>
> Mira si els contenidors estan corrent ("Up"):
>
> ```bash
> docker compose -f docker-compose.prod.yml ps
> ```
>
> ### Veure els logs (en cas d'error)
>
> Si alguna cosa falla, pots veure els logs en temps real.
>
> - **Backend:** `docker compose -f docker-compose.prod.yml logs -f tr2g2-back`
> - **Frontend:** `docker compose -f docker-compose.prod.yml logs -f tr2g2-front`
