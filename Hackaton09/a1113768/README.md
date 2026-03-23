# Hackatón (6 horas) – Sequelize & ORM Relacional
**Duración:** 6h continuas  
**Stack:** Node.js 18+, Express, Sequelize, MySQL (o PostgreSQL opcional), `sequelize` + `mysql2` (`pg` para Postgres)

> Objetivo: construir una API REST completamente funcional usando Sequelize con modelos, relaciones, validaciones, scopes, hooks, paginación, filtros, eager loading y transacciones. Al final tendrás un mini‑producto demostrable con documentación y una colección de pruebas.

---
## 0) Reglas, setup y entregables
**Reglas**
- Trabajo individual o en parejas.
- Puedes usar `sequelize.sync()` **o** migraciones con `sequelize-cli`. En producción se prefieren migraciones.
- Debes **versionar** el proyecto en Git y generar un `README.md` con instrucciones claras.

**Setup mínimo**
- `.env` con credenciales DB + `DB_SYNC=alter|none|force`.
- Scripts npm: `dev`, `db:migrate`, `db:seed` (si usas CLI), y `test` (opcional).

**Entregables obligatorios**
1. Repositorio con código fuente.
2. `README.md` con instrucciones (instalación, variables, arranque, endpoints).
3. Colección Postman/Thunder o curl listos para probar.
4. Capturas de respuestas clave (o tests) en la carpeta `docs/`.

**Criterios de evaluación (100 pts)**
- Modelado y relaciones (N:1, 1:N, N:M) — 4 pts
- CRUD completo con validaciones y paginación — 4 pts
- Eager loading correcto y control de N+1 — 3 pts
- Filtros avanzados y ordenamiento — 2 pts
- Hooks, scopes y campos calculados — 2 pts
- Transacciones con rollback ante error — 3 pts
- Documentación y calidad de código (linter, estructura) — 2 pts

---
## 1) Dominio del reto – "Mini-Learning Platform"
Construye una plataforma mínima para cursos y lecciones con comentarios de estudiantes.

**Entidades principales**
  - **User**: firstName, lastName, email (único), passwordHash, role ∈ {admin, instructor, student}.
  - **Course**: title (único), slug (único), description, published (bool), ownerId → User (instructor).
- **Lesson**: title, slug (único por curso), body, order (int), courseId → Course.
- **Enrollment** (N:M): User ←→ Course con campos: status ∈ {active, pending}, score (decimal, opcional).
- **Comment**: body, userId → User, lessonId → Lesson.

**Relaciones**
- User (instructor) 1:N Course (ownerId)
- Course 1:N Lesson
- User N:M Course (Enrollment como tabla intermedia con atributos)
- Lesson 1:N Comment; User 1:N Comment

> Puedes añadir `paranoid: true` en Course y Lesson para soft deletes.

---
## 2) Plan horario (6 horas)
**H0–H0:30** · Setup del proyecto: estructura, DB, `sequelize` + `postgres`, conexión, `sync`/migraciones.  
**H0:30–H1:30** · Modelado + asociaciones + seeders.  
**H1:30–H3:00** · CRUD + validaciones + scopes + hooks + paginación + filtros.  
**H3:00–H4:00** · Eager loading complejo y control de N+1.  
**H4:00–H5:00** · Transacciones (inscribir alumno y actualizar métricas).  
**H5:00–H6:00** · Documentación, pruebas (colección), demo final.

> **Checkpoint cada hora**: push a Git con tag `cp-h1`, `cp-h2`, ...

---
## 3) Requisitos funcionales (Endpoints sugeridos)
### 3.1 Users
- `POST /users` crear usuario (valida email único, role por defecto `student`).
- `GET /users?role=...&q=...&page=1&pageSize=10` listar con filtros, búsqueda por `q` en nombre/apellido/email.

### 3.2 Courses
- `POST /courses` (sólo instructor/admin): crea curso (auto‑slug desde title) y `published=false` por defecto.
- `GET /courses?published=true&q=&order=createdAt:DESC&page=1&pageSize=10` lista paginada con filtros.
- `GET /courses/:slug` detalle con `include: [owner, lessons(count), enrollments(count)]`.
- `PUT /courses/:id` actualizar; `DELETE /courses/:id` soft delete (si `paranoid`).

### 3.3 Lessons
- `POST /courses/:courseId/lessons` crea lección y asigna `order` incremental.
- `GET /courses/:courseId/lessons?order=ASC` lista con orden y `include` mínimo del curso.
- `PUT /lessons/:id` editar; `DELETE /lessons/:id` borrar (soft si `paranoid`).

### 3.4 Enrollments (N:M con atributos)
- `POST /courses/:courseId/enroll` inscribe a un `userId` con `status='pending'`.
- `PATCH /enrollments/:id/status` cambia a `active` y (opcional) asigna `score`.
- `GET /courses/:courseId/enrollments` lista con `include: [User]` y filtros por `status`.

### 3.5 Comments
- `POST /lessons/:lessonId/comments` crear comment (trim y valida longitud mínima en hook).
- `GET /lessons/:lessonId/comments?page=&pageSize=` lista paginada con `include: [author]`.

---
## 4) Requisitos técnicos (obligatorios)
1. **Modelos y asociaciones** definidas correctamente.
2. **Validaciones** (ej.: email válido y único; title de Course mínimo 5 chars; body de Lesson mínimo 20 chars).
3. **Scopes** útiles (ej.: `Course.addScope('published', { where: { published: true } })`).
4. **Hooks** (ej.: generar `slug` si no viene; `beforeCreate` para normalizar strings; `beforeCreate` en Comment que trimmee body y lance error si queda vacío).
5. **Paginación** (`limit` + `offset`) y **ordenamiento** (`order`).
6. **Eager loading** para evitar N+1 en vistas detalle (Course con owner, lessons y conteos) y listados.
7. **Transacciones**: una operación compuesta que cree Enrollment, cambie `status`, y actualice un contador de `studentsCount` en Course; si falla algo, **rollback**.
8. **Manejo de errores**: respuestas 400/404/409/500 coherentes y mensajes claros.

---
## 5) Sugerencia de implementación (pseudocódigo y snippets)
### 5.1 Slug y normalización
```js
// Hook en Course
Course.beforeValidate(course => {
  if (!course.slug && course.title) {
    course.slug = course.title.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  }
  if (course.title) course.title = course.title.trim();
});
```

### 5.2 Búsqueda y paginación
```js
const { Op } = require('sequelize');
const page = parseInt(req.query.page || '1');
const pageSize = parseInt(req.query.pageSize || '10');
const q = (req.query.q||'').trim();

const where = q ? { title: { [Op.like]: `%${q}%` } } : {};
const { rows, count } = await Course.findAndCountAll({
  where,
  order: [['createdAt','DESC']],
  limit: pageSize,
  offset: (page-1)*pageSize
});
res.json({ total: count, page, pageSize, data: rows });
```

### 5.3 Eager loading con conteos
```js
const course = await Course.findOne({
  where: { slug: req.params.slug },
  include: [
    { model: User, as: 'owner', attributes: ['id','firstName','lastName'] },
    { model: Lesson, as: 'lessons', attributes: ['id','title','order'] }
  ]
});
const studentsCount = await Enrollment.count({ where: { courseId: course.id, status: 'active' }});
res.json({ ...course.toJSON(), stats: { lessonsCount: course.lessons.length, studentsCount } });
```

### 5.4 Transacción de inscripción
```js
const t = await sequelize.transaction();
try {
  const enr = await Enrollment.create({ userId, courseId, status: 'pending' }, { transaction: t });
  await enr.update({ status: 'active' }, { transaction: t });
  await Course.increment('studentsCount', { by: 1, where: { id: courseId }, transaction: t });
  await t.commit();
  res.status(201).json({ ok: true });
} catch (e) {
  await t.rollback();
  res.status(400).json({ error: e.message });
}
```

### 5.5 Control N+1
- Usa `include` en listados estratégicos.
- Limita `attributes` para no traer columnas innecesarias.
- Prefiere `findAndCountAll` para paginación consistente.

---
## 6) Seeders / Datos de prueba
Si usas `sync`, crea un script `seed.js` manual. Ejemplo:
```js
await User.bulkCreate([
  { firstName:'Ada', lastName:'Lovelace', email:'ada@dev.io', passwordHash:'x', role:'instructor' },
  { firstName:'Linus', lastName:'Torvalds', email:'linus@dev.io', passwordHash:'y', role:'student' }
], { ignoreDuplicates: true });

const [course] = await Course.findOrCreate({
  where: { slug:'intro-node' },
  defaults: { title:'Intro a Node', description:'Curso base', published:true, ownerId: 1 }
});

await Lesson.bulkCreate([
  { title:'Setup', slug:'setup', body:'...', order:1, courseId: course.id },
  { title:'HTTP', slug:'http', body:'...', order:2, courseId: course.id }
]);
```

---
## 7) Rúbrica de validación rápida (auto‑checklist)
- [ ] `npm run dev` arranca sin errores
- [ ] `/courses` lista paginada con filtros `q`, `published`
- [ ] `/courses/:slug` trae owner + lessons + `studentsCount`
- [ ] `/courses/:id` soporta PUT/DELETE (soft)
- [ ] `/courses/:courseId/lessons` crea y ordena correctamente
- [ ] Transacción de inscripción funciona y hace rollback ante falla
- [ ] Comentarios se crean con trim y validación mínima
- [ ] No hay N+1 evidente en endpoints de detalle

---
## 8) Extras (para subir nota)
- Autenticación JWT básica y autorización por roles.
- Filtros `createdAt_gte/lte` para rangos de fechas.
- `paranoid` + `restore` en Course y Lesson.
- Cache simple de `/courses` (por ejemplo, en memoria) con invalidación.
- Pruebas con sqlite in-memory y migraciones CI.

---
## 9) Estructura sugerida del repo
```
├─ src/
│  ├─ db.js
│  ├─ models.js
│  ├─ server.js
│  ├─ routes/
│  │  ├─ users.routes.js
│  │  ├─ courses.routes.js
│  │  ├─ lessons.routes.js
│  │  ├─ enrollments.routes.js
│  │  └─ comments.routes.js
│  └─ seed.js
├─ .env.example
├─ README.md
├─ package.json
└─ docs/
   └─ screenshots/
```

---
## 10) Consejos y troubleshooting
- `ER_NO_REFERENCED_ROW`: revisa orden de creación de registros y FKs.
- `SequelizeUniqueConstraintError`: maneja 409 y mensajes claros.
- `sync({ alter })` puede no cubrir renombres complejos; en ese caso, usa migraciones.
- Controla la **zona horaria** y `charset` en migraciones si es necesario.
- Activa `logging: true` para depurar SQL y detectar N+1.

---
## 11) Entrega
- Sube el repositorio a GitHub/GitLab.
- Incluye colección Postman/Thunder y/o `curl` en el README.
- Publica un release `v1.0.0-hackathon` al finalizar.
