const $ = (sel) => document.querySelector(sel);
const outputEl = $('#output');
const summaryEl = $('#output-summary');
const cardsEl = $('#cards');

// ── Tab switching ──
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`.tab-panel[data-panel="${btn.dataset.tab}"]`).classList.add('active');
  });
});

function pretty(obj) {
  return typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
}

function row(key, val) {
  return `<div class="summary-row"><span class="summary-key">${key}</span><span class="summary-val">${val}</span></div>`;
}
function traducirTexto(texto, dicc) {
    let nuevoTexto = texto;
    for (let ingles in dicc) {
        let regex = new RegExp(ingles, "gi");
        nuevoTexto = nuevoTexto.replace(regex, dicc[ingles]);
    }
    return nuevoTexto;
}
function buildSummary(def, url, status, body) {
  let html = `<div class="summary-title">En base a la consulta de <strong>${def.title.split(' - ').slice(1).join(' - ')}</strong></div>`;
  
  // Lógica inteligente para la URL Oficial
  let urlOficial = url;
  let etiquetaLink = "Ver endpoint consultado";

  // Si es la NASA, apuntamos a la página web real, no al JSON
  if (def.id === 'nasa_apod') {
      urlOficial = `https://apod.nasa.gov/apod/ap${(body?.date || '').replace(/-/g, '').substring(2)}.html`;
      etiquetaLink = "Ver en sitio oficial de la NASA";
  }

  html += row('🔗 URL Oficial', `<a href="${urlOficial}" target="_blank" style="color:var(--accent)">${etiquetaLink}</a>`);
  html += row('📶 Estado HTTP', `<strong style="color:var(--ok)">${status} OK</strong>`);

  const id = def.id;

  if (id === 'github_user' && body) {
    html += row('👤 Usuario', body.login || '—');
    html += row('📛 Nombre', body.name || '—');
    html += row('🏢 Empresa', body.company || '—');
    html += row('📍 Ubicación', body.location || '—');
    html += row('📝 Bio', body.bio || '—');
    html += row('📦 Repos públicos', body.public_repos ?? '—');
    html += row('👥 Seguidores', body.followers ?? '—');
  } else if (id === 'wttr' && body && body.current_condition) {
    const c = body.current_condition[0];
    const area = body.nearest_area?.[0];
    const city = area?.areaName?.[0]?.value || '—';
    const country = area?.country?.[0]?.value || '—';
    html += row('📍 Ciudad', `${city}, ${country}`);
    html += row('🌡️ Temperatura', `${c.temp_C}°C (${c.temp_F}°F)`);
    html += row('💧 Humedad', `${c.humidity}%`);
    html += row('💨 Viento', `${c.windspeedKmph} km/h`);
    html += row('☁️ Descripción', c.weatherDesc?.[0]?.value || '—');
    html += row('👁️ Visibilidad', `${c.visibility} km`);
  } else if (id === 'frankfurter' && body && body.rates) {
    html += row('💵 Moneda base', body.base || 'USD');
    html += row('📅 Fecha', body.date || '—');
    html += row('🇵🇪 1 USD equivale a', `<strong style="font-size:16px;color:var(--ok)">${body.rates.PEN} soles peruanos (PEN)</strong>`);
  } else if ((id === 'poke_list') && body && body.results) {
    html += row('📦 Total disponibles', body.count ?? '—');
    html += row('📋 Pokémon en esta página', body.results.length);
    html += row('🔤 Lista', body.results.map(p => p.name).join(', '));
  } else if (id === 'poke_one' && body) {
    // --- POKÉMON ---
  } else if (id === 'poke_one' && body) {
    // Creamos la URL oficial de la Pokédex usando el nombre que trajo la API
    const urlOficial = `https://www.pokemon.com/es/pokedex/${(body.name || '').toLowerCase()}`;
    html += row('🔗 URL Oficial', `<a href="${urlOficial}" target="_blank" style="color:var(--accent)">Ver Pokédex de ${body.name}</a>`);
    
    html += row('⚡ Nombre', body.name || '—');
    html += row('🔢 ID', body.id ?? '—');
    html += row('⚖️ Peso', `${(body.weight / 10).toFixed(1)} kg`);
    html += row('📏 Altura', `${(body.height / 10).toFixed(1)} m`);
    html += row('🎯 Tipos', (body.types || []).map(t => t.type.name).join(', '));
    html += row('✨ Habilidades', (body.abilities || []).map(a => a.ability.name).join(', '));

  // --- RICK & MORTY ---
  } else if (id === 'rm_one' && body) {
    // Limpiamos el nombre (ej. "Rick Sanchez" -> "Rick_Sanchez") para la Wiki
    const nombreWiki = (body.name || '').replace(/\s+/g, '_');
    const urlWiki = `https://rickandmorty.fandom.com/wiki/${nombreWiki}`;
    html += row('🔗 Wiki Fandom', `<a href="${urlWiki}" target="_blank" style="color:var(--accent)">Ver perfil de ${body.name}</a>`);
    
    html += row('🧬 Nombre', body.name || '—');
    html += row('🟢 Estado', body.status || '—');
    html += row('👽 Especie', body.species || '—');
    html += row('⚧ Género', body.gender || '—');
    html += row('🌍 Origen', body.origin?.name || '—');
    html += row('📍 Última ubicación', body.location?.name || '—');

  // --- PELÍCULAS (TMDB) ---
  }  else if ((id === 'tmdb_trending' || id === 'tmdb_movie') && body) {
    if (body.results) {
      // Caso: TMDB Trending (Lista)
      const urlFija = "https://www.themoviedb.org/movie";
      html += row('🔗 URL Oficial', `<a href="${urlFija}" target="_blank" style="color:var(--accent)">Ver sitio oficial</a>`);
      
      html += row('🎬 Resultados', body.results.length);
      body.results.slice(0, 5).forEach((m, i) => {
        html += row(`#${i+1}`, `${m.title || m.name} (${(m.release_date || m.first_air_date || '').slice(0,4)}) — ⭐ ${m.vote_average}`);
      });
    } else {
      // Caso: TMDB Movie (Detalle individual)
      const urlPelicula = `https://www.themoviedb.org/movie/${body.id}`;
      html += row('🔗 URL Oficial', `<a href="${urlPelicula}" target="_blank" style="color:var(--accent)">Ver en TMDB</a>`);
      
      html += row('🎬 Título', body.title || body.name || '—');
      html += row('📅 Estreno', body.release_date || '—');
      html += row('⭐ Puntuación', `${body.vote_average} / 10`);
      html += row('🗣️ Idioma', body.original_language || '—');
      html += row('📝 Sinopsis', (body.overview || '—').slice(0, 200) + '...');
    }
   // Busca el bloque de cocktail dentro de buildSummary y reemplázalo por esto:
} else if (id === 'cocktail' && body && body.drinks) {
    const d = body.drinks[0];
    // Construimos una URL que busque el nombre de la bebida en el sitio oficial
    const urlBusqueda = `https://www.thecocktaildb.com/drink.php?c=${d.idDrink}`;
    
    html += row('🔗 URL Oficial', `<a href="${urlBusqueda}" target="_blank" style="color:var(--accent)">Ver receta en TheCocktailDB</a>`);
    html += row('🍹 Bebida', d?.strDrink || '—');
    html += row('🏷️ Categoría', d?.strCategory || '—');
    html += row('🍶 Tipo de vaso', d?.strGlass || '—');
    html += row('📝 Instrucciones', (d?.strInstructions || '—').slice(0, 200) + '...');
    }else if (id === 'fakestore' && Array.isArray(body)) {
    // 1. Cabecera limpia
    html += row('🛒 Total de productos', body.length);
    
    // 2. Bucle para renderizar cada producto como una mini-tarjeta
    body.forEach((p, i) => {
      html += `
        <div class="summary-row" style="flex-direction: column; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 10px 0;">
          <div style="display: flex; gap: 15px; align-items: center;">
            <a href="${p.image}" target="_blank" title="Haz clic para ver imagen completa">
              <img src="${p.image}" style="width: 60px; height: 60px; object-fit: contain; border-radius: 4px; background: white; cursor: pointer; border: 1px solid #ccc;">
            </a>
            <div>
              <div style="font-weight: bold; color: var(--accent); margin-bottom: 4px;">${p.title.slice(0, 35)}...</div>
              <div style="font-size: 13px; color: #aaa;">Precio: <span style="color:var(--ok)">$${p.price}</span> | Categoría: ${p.category}</div>
            </div>
          </div>
        </div>
      `;
    });
  } else if (id === 'unsplash' && body && body.results) {
    html += row('📸 Fotos encontradas', body.total ?? body.results.length);
    body.results.slice(0, 5).forEach((p, i) => {
      html += row(`Foto ${i+1}`, `<a href="${p.links?.html}" target="_blank" style="color:var(--accent)">${p.description || p.alt_description || 'Ver foto'}</a> — por ${p.user?.name || '—'}`);
    });
  }  else if (id === 'dummy_quotes' && body && body.quotes) {
    // Añadimos una nota informativa al principio
    html += row('📢 Nota', 'Frases célebres en su idioma original (Inglés)');
    
    body.quotes.forEach((q, i) => {
      // Usamos un estilo de bloque de cita para que se vea más elegante
      html += `
        <div class="summary-row" style="flex-direction:column; align-items:flex-start; border-bottom:1px solid rgba(255,255,255,0.05); padding:10px 0;">
          <span class="summary-key">💬 Frase ${i+1}</span>
          <blockquote style="margin: 5px 0; font-style: italic; color: var(--text); font-size: 13px;">
            "${q.quote}"
          </blockquote>
          <cite style="font-size: 11px; color: var(--accent);">— ${q.author}</cite>
        </div>
      `;
    });
  } else if (id === 'randomuser' && body && body.results) {
    body.results.forEach((u, i) => {
      html += row(`👤 Persona ${i+1}`, `${u.name?.first} ${u.name?.last} — ${u.email} — ${u.location?.city}, ${u.location?.country}`);
    });
  
   } else if (id === 'nasa_apod' && body) {
    html += row('🌌 Título', body.title || '—');
    html += row('📅 Fecha', body.date || '—');
    html += row('📸 Imagen', `<a href="${body.hdurl || body.url}" target="_blank" style="color:var(--accent)">Ver foto en alta resolución</a>`);
    
    // Mostramos la explicación tal cual, sin intentar traducirla mal
    html += `
        <div class="summary-row" style="flex-direction:column; align-items:flex-start; margin-top:10px;">
            <span class="summary-key">📝 Explicación:</span>
            <p style="font-size:13px; line-height:1.5; color:var(--text); margin-top:5px; background:rgba(255,255,255,0.05); padding:10px; border-radius:5px;">
                ${body.explanation || '—'}
            </p>
            <span style="font-size:11px; color:var(--muted); margin-top:5px;">
                * Nota: El texto se presenta en inglés por ser la fuente oficial de la NASA.
            </span>
        </div>
    `;
;
  } else {
    html += row('📦 Datos recibidos', 'Revisa el tab JSON Raw para ver la respuesta completa.');
  }

  return html;
}

function setOutput(text, isError = false) {
  const borderColor = isError ? 'rgba(255, 107, 107, 0.35)' : 'rgba(255, 255, 255, 0.08)';
  outputEl.textContent = text;
  outputEl.style.borderColor = borderColor;
  if (isError) {
    summaryEl.innerHTML = `<div class="summary-error">❌ Error en la consulta. Revisa el tab JSON Raw para más detalles.</div>`;
  } else {
    summaryEl.innerHTML = `<div class="summary-title" style="color:var(--muted)">Ejecuta una tarjeta para ver la interpretación aquí.</div>`;
  }
  summaryEl.style.borderColor = borderColor;
}

async function runApi(def, values) {
  const url = def.buildUrl(values);
  console.log("Intentando conectar a:", url); // <--- ESTO ES CLAVE
  
  const headers = def.buildHeaders ? def.buildHeaders(values) : {};
  setOutput(`Enviando request...\n${def.method} ${url}`);

  try {
    const res = await fetch(url, { method: def.method, headers });

    const contentType = res.headers.get('content-type') || '';
    let body;

    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }

    if (!res.ok) {
      const errText = pretty({ error: true, status: res.status, statusText: res.statusText, url, body });
      outputEl.textContent = errText;
      outputEl.style.borderColor = 'rgba(255, 107, 107, 0.35)';
      summaryEl.innerHTML = `<div class="summary-error">❌ La API respondió con error <strong>${res.status} ${res.statusText}</strong>. Revisa el tab JSON Raw.</div>`;
      summaryEl.style.borderColor = 'rgba(255, 107, 107, 0.35)';
      return;
    }

    const jsonText = pretty({ ok: true, status: res.status, url, body });
    outputEl.textContent = jsonText;
    outputEl.style.borderColor = 'rgba(255, 255, 255, 0.08)';
   // ... dentro de runApi, después de asignar el innerHTML:
  // ... dentro de runApi, después de cargar los datos:
    summaryEl.innerHTML = buildSummary(def, url, res.status, body);
    summaryEl.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    
    // Scroll automático aquí
    desplazarResultados();
  } catch (err) {
    console.error("Error capturado:", err); // <--- MIRA ESTO EN LA CONSOLA
    setOutput("Error: " + err.message, true);

    const errText = pretty({ error: true, message: err.message, url, stack: err.stack })
  ;

    outputEl.textContent = errText;
    outputEl.style.borderColor = 'rgba(255, 107, 107, 0.35)';
    summaryEl.innerHTML = `<div class="summary-error">❌ ${err?.message || String(err)}</div><div style="color:var(--muted);margin-top:8px;font-size:12px">Posible CORS o sin internet. Prueba desde Postman.</div>`;
    summaryEl.style.borderColor = 'rgba(255, 107, 107, 0.35)';
  }
}

function cardTemplate(def) {
  const wrap = document.createElement('article');
  wrap.className = 'card';

  wrap.innerHTML = `
    <div class="card-banner"><img src="${def.image}" alt="${def.title}" loading="lazy" /></div>
    <div class="card-header-row">
      <div class="card-num">${def.title.split(' - ')[0]}</div>
      <div><h4>${def.title.split(' - ').slice(1).join(' - ')}</h4></div>
    </div>
    <div class="inputs"></div>
    <div class="actions">
      <button class="btn primary">Ejecutar</button>
      <button class="btn">¿Necesitas ayuda?</button>
    </div>
  `;

 const inputsEl = wrap.querySelector('.inputs');
  const buttons = wrap.querySelectorAll('button');
  const runBtn = buttons[0];
  const urlBtn = buttons[1]; // Asegúrate de que este sea el botón de ayuda
  const inputs = {};

  // Crear inputs
  for (const inp of def.inputs) {
    const label = document.createElement('label');
    label.className = 'field';
    label.innerHTML = `<span class="muted">${inp.label}</span><input placeholder="${inp.placeholder || ''}" value="${inp.defaultValue || ''}" />`;
    inputs[inp.key] = label.querySelector('input');
    inputsEl.appendChild(label);
  }

runBtn.addEventListener('click', () => {
    const values = Object.fromEntries(Object.entries(inputs).map(([k, el]) => [k, el.value]));
    runApi(def, values);
  });

  // Evento Ayuda
  urlBtn.addEventListener('click', () => {
    const mensajesAyuda = {
      // ... (tus mensajes igual)
      github_user: "Escribe el nombre de usuario de GitHub para ver su perfil.",      wttr: "Ingresa el nombre de la ciudad para ver su clima.",
      frankfurter: "Consulta el tipo de cambio actual del dólar a soles (PEN).",
      poke_list: "Define cuántos Pokémon quieres listar.",
      poke_one: "Escribe el nombre de un Pokémon para ver sus detalles.",
      rm_list: "Ingresa el número de página para ver personajes.",
      rm_one: "Ingresa el ID del personaje que deseas consultar.",
      cocktail: "Escribe el nombre de un cóctel para ver su receta.",
      fakestore: "Define cuántos productos de la tienda deseas listar.",
      unsplash: "Escribe un tema para buscar fotos relacionadas.",
      dummy_quotes: "Define cuántas frases inspiradoras quieres generar.",
      randomuser: "Define cuántos usuarios ficticios deseas crear.",
      tmdb_trending: "Escribe 'day' o 'week' para ver las tendencias.",
      tmdb_movie: "Ingresa el ID de la película para ver su detalle.",
      nasa_apod: "Ingresa una fecha (YYYY-MM-DD) para ver la foto de la NASA."
    };

    const mensaje = mensajesAyuda[def.id] || "Consulta la documentación oficial.";
    
    // Mostramos solo el mensaje en la interpretación
    summaryEl.innerHTML = `<div class="summary-title" style="padding:20px; font-size:16px;">${mensaje}</div>`;
    desplazarResultados();
  });

  return wrap;
}

// 15 endpoints (sin unificar)
const apis = [
  {
    id: 'github_user',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmdDx3ZsJrvMBwuADeKhZwYGTZXE2-FWC_tw&s',
    title: '01 - GitHub: Perfil de Usuario',
    method: 'GET',
    base: 'https://api.github.com',
    inputs: [
      { key: 'username', label: '👤 Nombre de usuario de GitHub', defaultValue: 'octocat', placeholder: 'ej: octocat' }
    ],
    buildUrl: (v) => `https://api.github.com/users/${encodeURIComponent(v.username)}`
  },
  {
    id: 'wttr',
    image: 'https://i.pinimg.com/1200x/45/63/69/456369f83acf659dc8d67ecc2a258c97.jpg',
    title: '02 - Clima: Tiempo en tu ciudad',
    method: 'GET',
    base: 'https://api.open-meteo.com',
    inputs: [
      { key: 'city', label: '🌤️ ¿De qué ciudad quieres el clima?', defaultValue: 'Lima', placeholder: 'ej: Lima' }
    ],
    buildUrl: (v) => `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(v.city)}&count=1&language=es&format=json`
  },
  // BUSCA ESTO EN TU ARREGLO 'apis' Y REEMPLÁZALO:
{
  id: 'frankfurter', // Mantén el ID para que buildSummary lo reconozca
  image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
  title: '03 - Tipo de cambio: USD → PEN',
  method: 'GET',
  base: 'https://open.er-api.com', 
  inputs: [],
  buildUrl: () => `https://open.er-api.com/v6/latest/USD`
},
  {
    id: 'poke_list',
    image: 'https://images.unsplash.com/photo-1542779283-429940ce8336?w=600&q=80',
    title: '04 - Pokémon: Lista de Pokémon',
    method: 'GET',
    base: 'https://pokeapi.co',
    inputs: [
      { key: 'limit', label: '🔢 ¿Cuántos Pokémon quieres ver?', defaultValue: '10', placeholder: 'ej: 10' }
    ],
    buildUrl: (v) => `https://pokeapi.co/api/v2/pokemon?limit=${encodeURIComponent(v.limit)}`
  },
  {
    id: 'poke_one',
    image: 'https://images.unsplash.com/photo-1542779283-429940ce8336?w=600&q=80',
    title: '05 - Pokémon: Detalle de un Pokémon',
    method: 'GET',
    base: 'https://pokeapi.co',
    inputs: [
      { key: 'name', label: '⚡ Nombre del Pokémon (en inglés)', defaultValue: 'pikachu', placeholder: 'ej: pikachu' }
    ],
    buildUrl: (v) => `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(v.name)}`
  },
  {
    id: 'rm_list',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80',
    title: '06 - Rick & Morty: Lista de Personajes',
    method: 'GET',
    base: 'https://rickandmortyapi.com',
    inputs: [
      { key: 'page', label: '📄 Número de página', defaultValue: '1', placeholder: 'ej: 1' }
    ],
    buildUrl: (v) => `https://rickandmortyapi.com/api/character?page=${encodeURIComponent(v.page)}`
  },
  {
    id: 'rm_one',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80',
    title: '07 - Rick & Morty: Detalle de Personaje',
    method: 'GET',
    base: 'https://rickandmortyapi.com',
    inputs: [
      { key: 'id', label: '🧬 ID del personaje (número)', defaultValue: '1', placeholder: 'ej: 1' }
    ],
    buildUrl: (v) => `https://rickandmortyapi.com/api/character/${encodeURIComponent(v.id)}`
  },
  {
    id: 'cocktail',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80',
    title: '08 - Cócteles: Buscar una bebida',
    method: 'GET',
    base: 'https://www.thecocktaildb.com',
    inputs: [
      { key: 'q', label: '🍹 ¿Qué bebida quieres buscar?', defaultValue: 'margarita', placeholder: 'ej: margarita' }
    ],
    buildUrl: (v) => `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(v.q)}`
  },
  {
    id: 'fakestore',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
    title: '09 - Tienda: Lista de Productos',
    method: 'GET',
    base: 'https://fakestoreapi.com',
    inputs: [
      { key: 'limit', label: '🛒 ¿Cuántos productos quieres ver?', defaultValue: '5', placeholder: 'ej: 5' }
    ],
    buildUrl: (v) => `https://fakestoreapi.com/products?limit=${encodeURIComponent(v.limit)}`
  },
  {
    id: 'unsplash',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
    title: '10 - Unsplash: Buscar Fotos',
    method: 'GET',
    base: 'https://api.unsplash.com',
    inputs: [
      { key: 'query', label: '📸 ¿Qué tipo de foto quieres buscar?', defaultValue: 'nature', placeholder: 'ej: nature, city, food' },
      { key: 'limit', label: '🔢 ¿Cuántas fotos quieres ver?', defaultValue: '5', placeholder: 'ej: 5' }
    ],
    buildUrl: (v) => `https://api.unsplash.com/search/photos?query=${encodeURIComponent(v.query)}&per_page=${encodeURIComponent(v.limit)}`,
    buildHeaders: () => ({ Authorization: 'Client-ID InHeVg0dh6Aly2yxo8FXytTPnb0qj2-sWUMaEfUGeT8' })
  },
  {
    id: 'dummy_quotes',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80',
    title: '11 - Frases: Citas Inspiradoras',
    method: 'GET',
    base: 'https://dummyjson.com',
    inputs: [
      { key: 'limit', label: '💬 ¿Cuántas frases quieres ver?', defaultValue: '5', placeholder: 'ej: 5' }
    ],
    buildUrl: (v) => `https://dummyjson.com/quotes?limit=${encodeURIComponent(v.limit)}`
  },
  {
    id: 'randomuser',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
    title: '12 - Usuarios: Personas Ficticias',
    method: 'GET',
    base: 'https://randomuser.me',
    inputs: [
      { key: 'results', label: '👥 ¿Cuántas personas ficticias quieres generar?', defaultValue: '3', placeholder: 'ej: 3' }
    ],
    buildUrl: (v) => `https://randomuser.me/api/?results=${encodeURIComponent(v.results)}`
  },
  {
    id: 'tmdb_trending',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
    title: '13 - TMDB: Trending',
    destinationUrl: 'https://www.themoviedb.org/movie',
    method: 'GET',
    base: 'https://api.themoviedb.org',
    inputs: [
      { key: 'window', label: '🎬 Consulta tendencia', defaultValue: 'day', placeholder: 'day | week' }
    ],
    buildUrl: (v) => `https://api.themoviedb.org/3/trending/movie/${encodeURIComponent(v.window)}?language=es-ES`,
    buildHeaders: () => ({ Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNWI3NTQ5YmExZDQwNWMzMmM3ZmU2ZGVlNzQ2Mzg5MiIsIm5iZiI6MTc3Mjc3MTc1OC42NDIsInN1YiI6IjY5YWE1OWFlNGY1MTU3MjA3Yzk5ODQ3MyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.KRnomA8Xt4RU25EGtBx_iyY02Fy0cGD4ETTCKJLEtZk`, Accept: 'application/json' })  },
    {
  id: 'tmdb_movie',
  image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80',
  title: '14 - TMDB: Detalle de película',
  method: 'GET',
  base: 'https://api.themoviedb.org',
  inputs: [
    { key: 'id', label: '🎥 Consulta ID de película', defaultValue: '550', placeholder: 'ej: 550' }
  ],
  buildUrl: (v) => `https://api.themoviedb.org/3/movie/${encodeURIComponent(v.id)}?language=es-ES`,
  buildHeaders: () => ({ 
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNWI3NTQ5YmExZDQwNWMzMmM3ZmU2ZGVlNzQ2Mzg5MiIsIm5iZiI6MTc3Mjc3MTc1OC42NDIsInN1YiI6IjY5YWE1OWFlNGY1MTU3MjA3Yzk5ODQ3MyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.KRnomA8Xt4RU25EGtBx_iyY02Fy0cGD4ETTCKJLEtZk`, 
    Accept: 'application/json' 
  })
},
{
    id: 'nasa_apod',
    image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&q=80',
    title: '15 - NASA: Foto Astronómica del Día',
    method: 'GET',
    base: 'https://api.nasa.gov',
    inputs: [
      { key: 'date', label: '📅 Fecha (YYYY-MM-DD)', defaultValue: '2023-10-18', placeholder: 'ej: 2023-10-18' }
    ],
    // Usamos el endpoint APOD oficial
    buildUrl: (v) => `https://api.nasa.gov/planetary/apod?date=${encodeURIComponent(v.date)}&api_key=ShtDCgeZ2ZLId2q7N3TwCVhoas4W6bmq3mJMA09g`
  }
];  


// Asegúrate de que 'render' y el resto de eventos estén aquí afuera, al nivel raíz
function render() {
  cardsEl.innerHTML = '';
  apis.forEach((def) => cardsEl.appendChild(cardTemplate(def)));
} 

// Llamada inicial
render();

$('#copy').addEventListener('click', () => {
  const jsonText = outputEl.textContent; // Obtenemos el texto del JSON
  navigator.clipboard.writeText(jsonText).then(() => {
    // Llamamos a la función para mostrar el mensaje flotante
    mostrarToast("¡JSON copiado al portapapeles!");
  });
});

$('#clear').addEventListener('click', () => {
  setOutput('Selecciona una tarjeta y presiona "Ejecutar".');
});
// Función para hacer scroll automático a la zona de resultados
function desplazarResultados() {
  const summaryArea = document.querySelector('#output-summary');
  if (summaryArea) {
    summaryArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
function mostrarToast(mensaje) {
  const toast = document.createElement('div');
  toast.textContent = mensaje;
  toast.style.cssText = `
    position: fixed; bottom: 20px; right: 20px;
    background: var(--accent); color: white;
    padding: 12px 24px; border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 1000; animation: fadeInOut 2s forwards;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}