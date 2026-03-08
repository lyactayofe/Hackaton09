# 🚀 API Gateway - Hackaton 07 IDAT

## 📚 ¿Qué es este proyecto?

Este proyecto es un **API Gateway** desarrollado para el Hackaton 07 del curso de Backend en IDAT. Un API Gateway es un programa que centraliza múltiples conexiones a APIs externas en un solo lugar, permitiendo consultarlas de forma organizada.

## 🛠️ Tecnologías Utilizadas

- **NodeJS** - Entorno de ejecución de JavaScript
- **JavaScript** - Lenguaje de programación
- **Postman** - Herramienta para probar y documentar APIs (colección en file-system mode)
- **Frontend (HTML/CSS/JS)** - Página local para ejecutar las 15 APIs con `fetch`
- **APIs Públicas** - 15 APIs/Endpoints externos

---

## 📋 Lista de APIs Integradas

| # | API | Descripción | Requiere Key |
|---|-----|-------------|--------------|
| 1 | GitHub API | Datos de usuario de GitHub | ❌ No |
| 2 | wttr.in | Clima de una ciudad | ❌ No |
| 3 | Frankfurter | Tipo de cambio USD/PEN | ❌ No |
| 4 | PokéAPI | Lista de Pokemones | ❌ No |
| 5 | PokéAPI | Poderes de un Pokémon | ❌ No |
| 6 | Rick & Morty API | Lista de personajes | ❌ No |
| 7 | Rick & Morty API | Detalle de personaje | ❌ No |
| 8 | TheCocktailDB | Top bebidas y cócteles | ❌ No |
| 9 | FakeStore API | Productos de tienda | ❌ No |
| 10 | Unsplash | Fotografías por tema | ✅ Sí (gratis) |
| 11 | DummyJSON | Citas famosas | ❌ No |
| 12 | RandomUser.me | Datos ficticios de usuario | ❌ No |
| 13 | TMDB | Top películas en estreno | ✅ Sí (gratis) |
| 14 | TMDB | Detalle de película | ✅ Sí (gratis) |
| 15 | NASA API | Datos y fotos de Marte | ⚠️ DEMO_KEY |

---

## 🔑 APIs que Requieren Registro (Gratuito)

### 1. Unsplash (Fotografías)
1. Ve a [https://unsplash.com/developers](https://unsplash.com/developers)
2. Crea una cuenta gratuita
3. Crea una nueva aplicación
4. Copia tu **Access Key**
5. En Postman, ve al Environment "API Gateway - Variables"
6. Reemplaza `YOUR_UNSPLASH_KEY` con tu Access Key

### 2. TMDB - The Movie Database (Películas)
1. Ve a [https://developer.themoviedb.org](https://developer.themoviedb.org)
2. Crea una cuenta gratuita
3. Ve a Settings → API
4. Solicita una API Key (aprobación inmediata)
5. Copia tu **API Read Access Token** (el largo, tipo Bearer)
6. En Postman, ve al Environment "API Gateway - Variables"
7. Reemplaza `YOUR_TMDB_KEY` con tu token

### 3. NASA API (Marte)
- Ya viene configurada con `DEMO_KEY` que funciona para pruebas
- Para más requests, regístrate gratis en [https://api.nasa.gov](https://api.nasa.gov)

---

## 🚀 Cómo usar en Postman (File System Mode)

### Paso 1: Abrir el proyecto en Postman
- En Postman Desktop, usa **File → Open Folder** y selecciona la carpeta del proyecto.
- Postman detectará la carpeta `postman/` y cargará la colección y environments.

### Paso 2: Seleccionar el Environment
- En la esquina superior derecha, selecciona **"API Gateway - Variables"**.

### Paso 3: Ejecutar requests
- En el panel izquierdo, abre la colección **"API Gateway - Hackaton 07"**.
- Ejecuta cualquier request (01 al 15) con **Send**.

### Paso 4: Ver Tests
- Revisa la pestaña **Test Results**.

### Paso 5: Configurar variables / keys
- Abre el environment y cambia los placeholders:
  - `tmdb_api_key` (Bearer token)
  - `unsplash_access_key`
  - (opcional) `nasa_api_key` (por defecto `DEMO_KEY`)

---

## 📁 Estructura del Proyecto

```
SV73873639/
├── README.md                          ← Este archivo
└── postman/
    ├── collections/
    │   └── API-Gateway-Hackaton/
    │       ├── .resources/
    │       │   └── definition.yaml    ← Configuración de la colección
    │       ├── 01-GitHub-Usuario.request.yaml
    │       ├── 02-Clima-Ciudad.request.yaml
    │       ├── 03-Tipo-Cambio-Dolar.request.yaml
    │       ├── 04-Lista-Pokemones.request.yaml
    │       ├── 05-Poderes-Pokemon.request.yaml
    │       ├── 06-Rick-Morty-Personajes.request.yaml
    │       ├── 07-Rick-Morty-Detalle.request.yaml
    │       ├── 08-Top-Bebidas-Cocteles.request.yaml
    │       ├── 09-Productos-Tienda.request.yaml
    │       ├── 10-Fotografias-Tema.request.yaml
    │       ├── 11-Citas-Famosas.request.yaml
    │       ├── 12-Usuario-Ficticio.request.yaml
    │       ├── 13-Top-Peliculas-Estreno.request.yaml
    │       ├── 14-Detalle-Pelicula.request.yaml
    │       └── 15-NASA-Marte.request.yaml
    └── environments/
        └── API-Gateway.env.yaml       ← Variables de entorno
```

---

## 🧪 Cómo Funcionan los Tests en Postman

Cada request tiene tests automáticos escritos en JavaScript. Estos tests verifican que:

1. **La API responde correctamente** (Status 200)
2. **Los datos tienen el formato esperado** (arrays, objetos)
3. **Los campos importantes existen** (nombre, precio, etc.)

### Ejemplo de Test:
```javascript
// Verificar que la respuesta sea exitosa
pm.test("Status 200 - Respuesta exitosa", function () {
    pm.response.to.have.status(200);
});

// Verificar que el usuario existe
pm.test("El usuario tiene login", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.login).to.exist;
});
```

---

## 🌐 Cómo usar el Frontend

1. Abre el archivo: `frontend/index.html` (doble click)
2. Usa las tarjetas para ejecutar cada API
3. Para TMDB/Unsplash pega tus keys arriba y presiona **Guardar keys**

### Nota CORS
- Algunas APIs pueden bloquear requests desde el navegador por CORS.
- Si ves errores como **"Failed to fetch"**, prueba el endpoint desde Postman.

---

## 🔧 Variables de Entorno Configuradas

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `github_username` | rpinedaec83 | Usuario de GitHub a consultar |
| `nasa_api_key` | DEMO_KEY | API Key de NASA |
| `pokemon_name` | pikachu | Nombre del Pokémon |
| `city` | Lima | Ciudad para el clima |
| `rick_character_id` | 1 | ID del personaje (1=Rick, 2=Morty) |
| `movie_id` | 550 | ID de película TMDB (550=Fight Club) |
| `unsplash_access_key` | YOUR_UNSPLASH_KEY | Tu key de Unsplash |
| `tmdb_api_key` | YOUR_TMDB_KEY | Tu token de TMDB |
| `base_currency` | USD | Moneda origen |
| `target_currency` | PEN | Moneda destino (Soles) |

---

## 💡 Conceptos Aprendidos

### ¿Qué es una API?
Una **API** (Application Programming Interface) es como un mesero en un restaurante: tú haces un pedido (request), el mesero lo lleva a la cocina (servidor), y te trae la respuesta (response).

### ¿Qué es un API Gateway?
Un **API Gateway** es como un centro de llamadas que recibe todas las consultas y las distribuye a las APIs correctas. En lugar de que tu aplicación hable directamente con 14 APIs diferentes, habla con el Gateway y él se encarga de todo.

### Métodos HTTP
- **GET** → Obtener datos (como leer un libro)
- **POST** → Enviar datos (como escribir un mensaje)
- **PUT** → Actualizar datos (como editar un documento)
- **DELETE** → Eliminar datos (como borrar un archivo)

### Códigos de Respuesta
- **200** ✅ → Todo bien
- **401** 🔑 → Necesitas autenticación
- **403** 🚫 → No tienes permiso
- **404** 🔍 → No encontrado
- **500** 💥 → Error del servidor

---

## 👩‍💻 Autora

**Daniela** - Estudiante de Backend, IDAT 2026

---

## 📝 Notas del Hackaton

- Este proyecto fue desarrollado como parte del **Hackaton 07** del curso de Backend
- Se utilizó **Postman** para probar y documentar todas las APIs antes de integrarlas
- Cada API fue probada con tests automáticos para verificar su funcionamiento
- Las APIs que requieren key tienen instrucciones de registro gratuito
