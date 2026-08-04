# Libros — Wiki Dinámica de Worldbuilding

SaaS para autores de sagas largas, fantasía o ciencia ficción: una base de
datos interactiva de personajes, ubicaciones (mapa), línea de tiempo y
objetos, para evitar agujeros de guion.

Este es el primer artefacto del proyecto (MVP). El segundo artefacto —el
Motor de Continuidad de Tramas y Personajes basado en IA— se construirá
sobre esta misma base de datos.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma 7 + PostgreSQL (vía `@prisma/adapter-pg`)
- Auth.js (NextAuth v5) con credenciales (email + contraseña)

## Modelo de datos

- **Book** (libro/proyecto) — pertenece a un `User`
- **Character** — nombre, alias, estado (vivo/fallecido/desaparecido/desconocido), descripción
- **CharacterRelation** — relaciones entre personajes (padre/madre, pareja, mentor, enemigo…) que alimentan el árbol genealógico
- **Chapter** — capítulos del libro
- **ChapterAppearance** — en qué capítulos aparece cada personaje y su estado en ese punto
- **Location** — ubicaciones, posicionables como pines sobre el mapa del libro (`Book.mapImageUrl`)
- **TimelineEvent** — eventos cronológicos, vinculados a personajes y ubicaciones
- **Item** — objetos, con dueño (personaje) y/o ubicación

## Desarrollo local

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Ten una base de datos PostgreSQL corriendo y copia `.env.example` a `.env`
   ajustando `DATABASE_URL` y `AUTH_SECRET` (genera este último con
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`).

3. Aplica las migraciones:

   ```bash
   npx prisma migrate dev
   ```

4. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

Abre [http://localhost:3000](http://localhost:3000).

### Subida de imágenes

Las imágenes de mapas se guardan en `public/uploads` en disco local. Para un
despliegue en producción (por ejemplo, serverless) conviene sustituir esto
por un proveedor de almacenamiento de objetos (S3, Vercel Blob, etc.).
