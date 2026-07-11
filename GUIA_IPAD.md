# 📱 Pelu Adventures en el iPad + cómo hacerlo más profesional

Pelu Adventures ya es una **PWA** (Progressive Web App): se puede instalar en el
iPad como si fuera una app de verdad (ícono propio, pantalla completa, y juega
**sin internet** después de la primera carga).

---

## ✅ Opción A (recomendada): subirlo a una web gratis y abrirlo en el iPad

Para que el iPad lo instale como app con ícono y funcione offline, el juego debe
abrirse desde una dirección **https://** (no desde un archivo). La forma más
fácil y gratis:

### 1. Súbelo a Netlify (sin cuenta técnica, arrastrar y soltar)
1. Entra a **https://app.netlify.com/drop**
2. Arrastra **toda la carpeta `PeluAdventures`** a la página.
3. En segundos te da una dirección tipo `https://pelu-adventures.netlify.app`.
4. (Opcional) Crea una cuenta gratis para que la dirección no expire y poder
   actualizar el juego.

> Alternativas igual de válidas: **GitHub Pages**, **Vercel** o **Cloudflare Pages**.
> Todas dan https gratis.

### 2. Instálalo en el iPad
1. Abre esa dirección en **Safari** (tiene que ser Safari, no Chrome).
2. Toca el botón **Compartir** (cuadrito con flecha hacia arriba).
3. **"Agregar a inicio"** → aparece el ícono de Pelu 🐱 en la pantalla.
4. Ábrelo desde el ícono: se ve a pantalla completa, sin barras del navegador.
5. Listo: a partir de ahí **funciona sin internet**.

Y para que lo jueguen las amigas de Cele: solo **compárteles el link**. Cada una
lo puede agregar a su propio iPad/celular.

---

## ✅ Opción B: en casa por WiFi (rápido, sin subir nada)

Sirve para probar en el iPad estando en la misma red, sin instalar como app:
1. En el PC, doble clic en **`start.bat`**.
2. Mira la IP del PC (en Windows: `ipconfig` → "Dirección IPv4", ej. `192.168.1.5`).
3. En el iPad (misma WiFi), abre en Safari: `http://192.168.1.5:8753`
4. Funciona mientras el PC esté encendido. (El modo offline/ícono completo es
   mejor con la Opción A.)

---

## 👧👭 Para que jueguen varias amigas (ya incluido)

El juego tiene **perfiles de jugadora**: al abrirlo por primera vez pide un
nombre, y cada niña tiene **su propio progreso** (estrellas, ropa, casa…). Se
puede cambiar de jugadora desde **Ajustes ⚙️ → Cambiar jugadora**. Así el mismo
iPad sirve para Cele y sus amigas sin mezclar avances.

---

## 🌟 Consejos para que se vea y se sienta más profesional

**Audio (lo que más "vida" agrega a esta edad).**
- Música de fondo suave y efectos: "ding" al acertar, "pop" al recolectar,
  maullidos de Pelu. Un par de sonidos bien puestos cambian por completo la
  sensación. (Phaser ya trae motor de audio; falta agregar los archivos.)

**Identidad visual.**
- Una **pantalla de inicio** con el logo de Pelu y un botón grande "Jugar".
- Mantener una paleta y tipografía consistentes (ya hay base rosada/morada).
- Cuando haya dibujos definitivos de Pelu, reemplazar el SVG y los emojis por el
  arte final — la estructura ya está pensada para eso (no hay que reprogramar).

**Sensación de progreso y "engagement sano".**
- **Logros/medallas** ("Primera carrera ganada", "Chef estrella", "10 secretos").
- **Misión del día** que invita a volver (sin presionar): "Hoy: cocina algo y
  decora tu cuarto".
- Una **vitrina de colección** para ver todo lo desbloqueado y los tesoros.

**Calidad y confianza.**
- Mantener el principio actual: **nunca se pierde**, siempre se anima. Eso genera
  confianza y ganas de seguir.
- Botones grandes y texto claro (ya está) para manos pequeñas en pantalla táctil.
- Probarlo con Cele y una amiga y ver qué les engancha: **sus reacciones son la
  mejor guía de diseño**.

**Crecer con ella.**
- La dificultad por edad (Ajustes) ya hace que escale. A futuro: contenido nuevo
  cada cierto tiempo (recetas, niveles, ropa) para que siempre haya algo que
  descubrir.

**Privacidad y seguridad (importante para compartir con amigas).**
- El juego **no pide datos, no tiene anuncios y no se conecta a nada**: todo el
  progreso queda en el dispositivo. Es seguro compartir el link tal cual.
- Si algún día agregas cuentas online o ranking entre amigas, ahí sí conviene
  pensar en permisos de los papás.

---

## 🔄 Cuando actualices el juego

Si cambias archivos y ya lo subiste, sube de nuevo la carpeta y aumenta el número
de versión en **`sw.js`** (`const VERSION = "pelu-v4"`...). Eso obliga al iPad a
refrescar el juego guardado en vez de usar la versión vieja.
