# 🐱 Pelu Adventures

Un juego hecho con cariño para **Celeste**, protagonizado por su peluche **Pelu**.
Pensado para crecer con ella durante muchos años.

---

## ▶️ Cómo jugar (ahora mismo)

**Forma recomendada:** doble clic en **`start.bat`**. Abre el juego en el
navegador con todo funcionando (incluida la aventura de plataformas). Necesita
tener **Python** instalado (ya lo está en este equipo).

**Forma rápida:** doble clic en **`index.html`**. Funciona casi todo; si la
aventura de plataformas no carga bien, usa `start.bat`.

> No necesita internet. El progreso (estrellas, ropa, muebles, mascotas) se
> guarda solo en el computador.

Para jugar en teléfono o tablet: copia la carpeta y abre `index.html`, o sirve
la carpeta con cualquier servidor estático.

---

## 🎯 La idea

No es una copia de Avatar World, pero toma lo que lo hace mágico y lo pone al
servicio de Celeste: **libertad, personalización, decoración, exploración,
descubrimiento y sensación de progreso.**

La clave del diseño: **las habilidades para la vida están escondidas dentro de
la aventura.** Nunca se siente como una clase. Celeste *cuenta flores para
regarlas*, *abre cofres diciendo palabras en inglés*, *cruza puentes resolviendo
patrones* y *cuida su dinero en el mercadito*. Aprende sin darse cuenta.

### El bucle de juego
```
Explorar el mundo  →  Vivir aventuras  →  Ganar estrellas ⭐
        ↑                                          ↓
  Descubrir lugares  ←  Comprar / personalizar / coleccionar
```

---

## 🧩 Qué hay ya en el juego (versión 1)

| Sistema | Qué hace |
|---|---|
| 🗺️ **Mundo con mapa** | 5 lugares; algunos se desbloquean con estrellas (exploración + progreso) |
| 👗 **Vestidor de Pelu** | Sombreros, gafas, collares, mochilas (personalización) |
| 🛋️ **Decorar la casa** | Pon y quita muebles en la habitación (creatividad) |
| 🐾 **Mascotas** | Colecciona animalitos que viven en la casa |
| 🏪 **Tienda** | Gasta estrellas en ropa, muebles y mascotas (manejo del dinero) |
| ✨ **Tesoros secretos** | A veces una aventura esconde un coleccionable (descubrimiento) |
| 🏃‍♀️ **Plataformas (Phaser)** | Pelu corre, salta y recolecta estrellas en un nivel de verdad |
| ⚙️ **Dificultad por edad/nivel** | Ajusta los retos de **4 a 12** — del 11 en adelante hay **álgebra, fracciones, potencias y multi-paso** (para altas capacidades). *El juego crece con ella.* |
| 🏠 **Casa interactiva** | Toca a Pelu, sus mascotas y los muebles para que reaccionen (burbujas de diálogo, emojis flotantes); botones para acariciar, dar premios y jugar. |

### Las aventuras (mini-juegos) y qué desarrollan
- 🏃‍♀️ **La Carrera del Bosque** (Bosque) → plataformas con Phaser: islas flotantes, enemigos, vidas, monedas/gemas, escalera, plataforma móvil y cronómetro (reflejos + exploración).
- 🚲 **La Gran Carrera** (Jardín) → carrera en bicicleta: Pelu pedalea sola, te mueves ⬆⬇ para **esquivar** los conos, juntas monedas y compites contra un rival hasta la meta (reflejos, anticipación y superarse). 💨 mantén para acelerar.
- 🍳 **¡A Cocinar!** (Cocina Mágica) → recetas por fases: agrega ingredientes en orden y cantidad, suma el total (mate), mezcla, hornea en el momento justo (timing) y decora libre (lectura, conteo, secuencia, estimación, creatividad).
- 🎣 **La Pesca de Pelu** (Lago Tranquilo) → mueve el anzuelo (⬅➡ o tocando el agua), bájalo con ⬇ y atrapa peces; cada especie nueva entra a la **colección de peces** (paciencia, puntería, reflejos y coleccionismo). ¡Evita la basura!
- 🤿 **El Buceo de Pelu** (Playa) → Pelu se sumerge; muévete ⬅➡ (o desliza) para juntar perlas 🦪 y joyas 💎, recoge burbujas 🫧 para no quedarte sin **aire** y esquiva las medusas 🪼 hasta el cofre del fondo (puntería, anticipación, manejo de un recurso).
- 🧩 **El Cuarto Secreto** (Cuarto Secreto) → escape room point-and-click: toca objetos, encuentra 3 pistas (una escondida tras una 🔑 llave), descubre el código del candado 🔒 y escapa por la 🚪 (observación, lógica, secuencia, descubrimiento). Con botón 💡 de pista para no atascarse.

### 🎨 Estilo
- Los juegos usan un look **pixel art 2D** (Phaser `pixelArt`). **Pelu** se mantiene como el gatito blanco dibujado a mano (SVG, `js/pelu-sprite.js`) — suave, tanto en el menú como en los juegos.
- El **mapa** es la vista clásica de **tarjetas** (tocas un lugar para entrar).
- *(Opcionales, en disco pero sin usar: `js/pixel.js` = motor de pixel art, y `js/overworld.js` = mapa caminable estilo Avatar World. Se pueden reactivar más adelante.)*

### 📱 Instalable en iPad (PWA) y para varias jugadoras
- Se instala en el iPad como app (ícono propio, pantalla completa, **juega sin internet**). Ver **[GUIA_IPAD.md](GUIA_IPAD.md)** para instalar y compartir con amigas.
- **Perfiles de jugadora**: cada niña tiene su propio progreso en el mismo equipo (Ajustes → Cambiar jugadora).
- 🌻 **Regar las Flores / 🐚 Conchas** → contar, sumar, restar, **multiplicar y dividir** según la edad (**matemáticas**)
- 🗝️ **El Cofre de Palabras** → palabras y, para las mayores, **traducir frases completas** (**inglés**)
- 🌉 **El Puente de Patrones** → patrones y **secuencias numéricas** (+n, ×2…) (**pensamiento lógico**)
- 🍎 **El Mercadito** → pagar y contar monedas (**manejo del dinero**)
- 💗 **Un Nuevo Amigo** → amabilidad, compartir y decir "no" a lo peligroso
  (**amistades sanas, seguridad personal, toma de decisiones, confianza**)

Cada acierto da estrellas y un mensaje de ánimo. **No se "pierde"**: si se
equivoca, Pelu la anima con cariño y vuelve a intentar. El objetivo es que se
sienta capaz y querida.

---

## 🌱 Ideas para que crezca con ella (hoja de ruta)

Pensadas para ir agregando de a poco, en orden de edad aproximada:

**4–6 años (ahora)**
- ✅ Lo que ya está: contar, colores/patrones, vestir, decorar, amabilidad.
- 🔜 Sonidos y musiquita (maullidos de Pelu, "¡ding!" al acertar).
- 🔜 Día y noche en la casa (mañana/tarde/noche) para enseñar rutinas y **buenos hábitos** (lavar dientes, dormir).

**6–8 años**
- 🔜 **Huerto / jardín que crece de verdad**: plantar semillas, regar cada día,
  cosechar → paciencia, constancia y un poco de ciencia.
- 🔜 **Recetas de cocina**: seguir pasos en orden (secuencias, fracciones simples: "media taza").
- 🔜 **Misiones de varios pasos** ("ayuda a 3 amigos") → planificación e **independencia**.
- 🔜 **Diario de Pelu**: Celeste elige cómo se siente Pelu → vocabulario emocional.

**8–10 años y más**
- 🔜 **Mini-economía**: la tienda con ahorro para un objeto caro → metas y paciencia con el dinero.
- 🔜 **Crear y vestir a sus propios personajes** (amigos de Pelu).
- 🔜 **Pequeñas historias con decisiones** que cambian el mundo → consecuencias y empatía.
- 🔜 **Modo "construir"**: diseñar habitaciones libres arrastrando objetos.
- 🔜 Inglés más rico: frases cortas, mini-diálogos.

**Ideas de personajes (temporales, para inventar juntos)**
- 🦔 **Erizo Pin** — el amigo tímido del bosque.
- 🐿️ **Ardilla Nuez** — comerciante simpática del mercado.
- 🦉 **Búho Sabio** — da pistas en los puzzles.
- 🦄 **Luz la Unicornio** — premio especial de mucho esfuerzo.

---

## 🛠️ Para quien programa (papá)

Hecho con HTML + CSS + JavaScript puro. La única dependencia es **Phaser 3**
(motor de juego 2D), incluido localmente para que funcione sin internet.

```
PeluAdventures/
├── index.html          ← punto de entrada
├── start.bat           ← lanzador recomendado (servidor + navegador)
├── styles.css          ← todos los estilos (colores, animaciones)
└── js/
    ├── lib/phaser.min.js ← motor Phaser 3 (no editar)
    ├── data.js         ← TODO el contenido: objetos, tienda, lugares, aventuras
    ├── pelu-sprite.js  ← la gatita blanca en SVG (una sola fuente de verdad)
    ├── game.js         ← navegación, mapa, casa, vestidor, tienda, guardado
    ├── aventuras.js    ← mini-juegos (mate, inglés, lógica, dinero, decisiones)
    ├── platformer.js   ← aventura de plataformas con Phaser
    └── race.js         ← carrera en bicicleta con Phaser
```

**El sprite de Pelu** vive en `pelu-sprite.js` como un SVG (gatita blanca). Se
usa tanto en el menú como dentro del juego de plataformas. Para cambiar el
dibujo de Pelu, solo se edita ese archivo. Los accesorios (sombrero, lazo, etc.)
se dibujan encima como capas, así que la ropa que compra sigue funcionando.

**Para agregar contenido nuevo** casi siempre basta con editar `js/data.js`:
- ¿Un sombrero nuevo? Copia una línea en `ropa` y cámbiale `nombre`, `emoji`, `precio`.
- ¿Un mueble, mascota o lugar nuevo? Igual, en su arreglo correspondiente.
- ¿Una aventura nueva? Agrégala en `aventuras` y, si es de un tipo nuevo,
  crea su función en `js/aventuras.js`.

**Arte:** todo usa emojis como marcador de posición. Cuando haya dibujos
definitivos de Pelu, se reemplazan los emojis por imágenes sin tocar la lógica.

**Guardado:** se usa `localStorage` (clave `pelu_adventures_save_v1`). En
Ajustes ⚙️ hay un botón para empezar de nuevo.

---

Hecho con 💖 para Celeste. *Prioridad: diversión, curiosidad y cariño por Pelu.*
