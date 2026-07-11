/* ============================================================
   PELU ADVENTURES — Datos del juego
   Todo el contenido (objetos, tiendas, aventuras) vive aquí.
   Está pensado para que agregar cosas nuevas sea muy fácil:
   solo copia un objeto del arreglo y cámbiale los valores.
   El arte es TEMPORAL (emojis y formas), fácil de reemplazar
   más adelante por dibujos definitivos.
   ============================================================ */

const DATA = {

  // -------- Personaje protagonista --------
  pelu: {
    nombre: "Pelu",
    base: "🐱", // peluche gatito (temporal)
  },

  // -------- Objetos para VESTIR a Pelu --------
  // slot: sombrero | collar | gafas | mochila
  ropa: [
    { id: "gorro_estrella", nombre: "Gorro de Estrellas", slot: "sombrero", emoji: "🎩", precio: 0,  inicial: true },
    { id: "lazo_rosa",      nombre: "Lazo Rosa",          slot: "collar",   emoji: "🎀", precio: 0,  inicial: true },
    { id: "corona",         nombre: "Corona Brillante",   slot: "sombrero", emoji: "👑", precio: 25 },
    { id: "gorro_lana",     nombre: "Gorro de Lana",      slot: "sombrero", emoji: "🧶", precio: 12 },
    { id: "gafas_sol",      nombre: "Gafas de Sol",       slot: "gafas",    emoji: "🕶️", precio: 10 },
    { id: "gafas_corazon",  nombre: "Gafas de Corazón",   slot: "gafas",    emoji: "😎", precio: 18 },
    { id: "bufanda",        nombre: "Bufanda Arcoíris",   slot: "collar",   emoji: "🧣", precio: 14 },
    { id: "mochila",        nombre: "Mochila Aventurera", slot: "mochila",  emoji: "🎒", precio: 20 },
    { id: "alas",           nombre: "Alas de Hada",       slot: "mochila",  emoji: "🦋", precio: 40 },
    { id: "flor_pelo",      nombre: "Flor en el Pelo",    slot: "sombrero", emoji: "🌸", precio: 8 },
  ],

  // -------- MUEBLES y decoración para la casa --------
  muebles: [
    { id: "cama",      nombre: "Camita Suave",     emoji: "🛏️", precio: 0,  inicial: true },
    { id: "alfombra",  nombre: "Alfombra",         emoji: "🟫", precio: 0,  inicial: true },
    { id: "planta",    nombre: "Planta Feliz",     emoji: "🪴", precio: 6 },
    { id: "lampara",   nombre: "Lámpara Cálida",   emoji: "💡", precio: 9 },
    { id: "tele",      nombre: "Televisión",       emoji: "📺", precio: 22 },
    { id: "sillon",    nombre: "Sillón Cómodo",    emoji: "🛋️", precio: 18 },
    { id: "mesa",      nombre: "Mesita",           emoji: "🪑", precio: 11 },
    { id: "cuadro",    nombre: "Cuadro Bonito",    emoji: "🖼️", precio: 13 },
    { id: "globos",    nombre: "Globos de Fiesta", emoji: "🎈", precio: 7 },
    { id: "pecera",    nombre: "Pecera",           emoji: "🐠", precio: 16 },
    { id: "piano",     nombre: "Piano",            emoji: "🎹", precio: 35 },
    { id: "libros",    nombre: "Estante de Libros",emoji: "📚", precio: 15 },
  ],

  // -------- MASCOTAS que Pelu puede coleccionar --------
  mascotas: [
    { id: "mariposa", nombre: "Mari la Mariposa", emoji: "🦋", precio: 0,  inicial: true },
    { id: "perrito",  nombre: "Pancho el Perrito", emoji: "🐶", precio: 20 },
    { id: "conejo",   nombre: "Copo el Conejo",    emoji: "🐰", precio: 24 },
    { id: "pajaro",   nombre: "Pío el Pajarito",   emoji: "🐤", precio: 16 },
    { id: "tortuga",  nombre: "Tito la Tortuga",   emoji: "🐢", precio: 18 },
    { id: "unicornio",nombre: "Luz la Unicornio",  emoji: "🦄", precio: 50 },
  ],

  // -------- LUGARES del mundo (mapa) --------
  // Cada lugar puede tener aventuras. Algunos se desbloquean.
  lugares: [
    { id: "casa",    nombre: "Casa de Pelu",       emoji: "🏠", desbloqueado: true,  color: "#ffd9ec" },
    { id: "jardin",  nombre: "Jardín Mágico",      emoji: "🌷", desbloqueado: true,  color: "#d9ffe0" },
    { id: "cocina",  nombre: "Cocina Mágica",      emoji: "🧁", desbloqueado: true,  color: "#fff0e0" },
    { id: "lago",    nombre: "Lago Tranquilo",     emoji: "🎣", desbloqueado: true,  color: "#d9f0ff" },
    { id: "cuarto",  nombre: "Cuarto Secreto",     emoji: "🗝️", desbloqueado: true,  color: "#efe4ff" },
    { id: "colegio", nombre: "Colegio de Brujitas", emoji: "🏰", desbloqueado: true,  color: "#e4d6ff" },
    { id: "tienda",  nombre: "Tienda del Pueblo",  emoji: "🏪", desbloqueado: true,  color: "#fff4d9" },
    { id: "bosque",  nombre: "Bosque de Secretos", emoji: "🌲", desbloqueado: true,  precio: 15, color: "#d9f0ff" },
    { id: "playa",   nombre: "Playa Soleada",      emoji: "🏖️", desbloqueado: true,  precio: 30, color: "#fff0d9" },
  ],

  /* ============================================================
     AVENTURAS = mini-juegos que enseñan habilidades SIN sentirse
     como tarea. Cada una da estrellas ⭐ al completarse.
     tipo:
       "matematicas" | "ingles" | "logica" | "dinero" | "decision"
     ============================================================ */
  aventuras: [
    {
      id: "regar_flores",
      lugar: "jardin",
      nombre: "Regar las Flores",
      emoji: "🌻",
      tipo: "matematicas",
      intro: "Las flores tienen sed. ¡Cuenta cuántas hay y dale a Pelu el número correcto de gotas! 💧",
    },
    {
      id: "cofre_palabras",
      lugar: "bosque",
      nombre: "El Cofre de Palabras",
      emoji: "🗝️",
      tipo: "ingles",
      intro: "Un cofre mágico se abre si dices el nombre en inglés del objeto. ¿Lo descubres?",
    },
    {
      id: "puente_patrones",
      lugar: "bosque",
      nombre: "El Puente de Patrones",
      emoji: "🌉",
      tipo: "logica",
      intro: "Para cruzar el puente, completa la secuencia mágica. ¿Qué sigue?",
    },
    {
      id: "mercado",
      lugar: "tienda",
      nombre: "El Mercadito",
      emoji: "🍎",
      tipo: "dinero",
      intro: "Ayuda a Pelu a comprar y a contar el cambio. ¡Cuidado con las monedas!",
    },
    {
      id: "conchas",
      lugar: "playa",
      nombre: "Coleccionar Conchas",
      emoji: "🐚",
      tipo: "matematicas",
      intro: "Suma las conchas que encuentra Pelu en la arena.",
    },
    {
      id: "amigos",
      lugar: "jardin",
      nombre: "Un Nuevo Amigo",
      emoji: "💗",
      tipo: "decision",
      intro: "Pelu conoce a alguien en el jardín. ¿Cómo lo trata? Tú decides.",
    },
    {
      id: "carrera_bosque",
      lugar: "bosque",
      nombre: "La Carrera del Bosque",
      emoji: "🏃‍♀️",
      tipo: "plataformas",
      intro: "¡Corre y salta con Pelu por el bosque, junta estrellas y llega a la meta! Usa las flechas/ESPACIO o los botones en pantalla.",
    },
    {
      id: "gran_carrera",
      lugar: "jardin",
      nombre: "La Gran Carrera",
      emoji: "🚲",
      tipo: "carrera",
      intro: "¡Pelu pedalea en su bici! Muévete ⬆⬇ para esquivar los conos 🚧, junta monedas 🪙 y gánale al rival hasta la meta. Mantén 💨 para acelerar.",
    },
    {
      id: "cocinar",
      lugar: "cocina",
      nombre: "¡A Cocinar!",
      emoji: "🍳",
      tipo: "cocina",
      intro: "¡Pelu abre su cocina! Elige una receta, agrega los ingredientes en orden, mezcla, hornea en el momento justo y decórala a tu gusto. 👩‍🍳",
    },
    {
      id: "pescar",
      lugar: "lago",
      nombre: "La Pesca de Pelu",
      emoji: "🐟",
      tipo: "pesca",
      intro: "¡Pelu va a pescar! Mueve el anzuelo con ⬅➡, baja con ⬇ (o toca el agua) y atrapa peces. Cada especie nueva entra a tu colección. ¡Cuidado con la basura! 🥾",
    },
    {
      id: "bucear",
      lugar: "playa",
      nombre: "El Buceo de Pelu",
      emoji: "🤿",
      tipo: "buceo",
      intro: "¡Pelu se sumerge! Muévete ⬅➡ (o desliza) para juntar perlas 🦪 y joyas 💎. Recoge burbujas 🫧 para no quedarte sin aire y esquiva las medusas 🪼. ¡Llega al cofre del fondo! 🧰",
    },
    {
      id: "escapar",
      lugar: "cuarto",
      nombre: "El Cuarto Secreto",
      emoji: "🧩",
      tipo: "escape",
      intro: "¡Pelu quedó encerrada en un cuarto misterioso! Toca los objetos, encuentra 3 pistas escondidas, descubre el código del candado 🔒 y ¡escapa! 🚪 Si te atascas, usa la 💡 pista.",
    },
    {
      id: "cap1",
      lugar: "colegio",
      nombre: "Cap. 1: El Primer Día",
      emoji: "📖",
      tipo: "historia",
      capitulo: "cap1",
      intro: "🏰 La novela de Pelu. Es su primer día en el Colegio de Gatitas Brujitas. Pelu es mitad brujita 🔮 y mitad vampira 🦇 — la única así. Toca para leer y elige qué hace.",
    },
    {
      id: "cap2",
      lugar: "colegio",
      nombre: "Cap. 2: El Volcán",
      emoji: "🌋",
      tipo: "historia",
      capitulo: "cap2",
      intro: "🌋 Segundo capítulo. La clase repite un hechizo que Pelu ya domina y por dentro le crece un “volcán” de aburrimiento. Aprende la Respiración del Dragón 🐉 y descubre que su mente rápida sirve para ayudar a Luna. Toca para leer y elegir.",
    },
  ],

  // -------- PECES del Lago (colección + valores) --------
  peces: [
    { emoji: "🐟", nombre: "Pececito",     valor: 1, peso: 30, vel: [50, 90] },
    { emoji: "🐠", nombre: "Pez Tropical", valor: 2, peso: 24, vel: [60, 100] },
    { emoji: "🦐", nombre: "Camarón",      valor: 2, peso: 14, vel: [40, 70] },
    { emoji: "🐡", nombre: "Pez Globo",    valor: 3, peso: 12, vel: [70, 110] },
    { emoji: "🦀", nombre: "Cangrejo",     valor: 3, peso: 9,  vel: [40, 70] },
    { emoji: "🐢", nombre: "Tortuga",      valor: 4, peso: 6,  vel: [50, 80] },
    { emoji: "🐙", nombre: "Pulpo",        valor: 5, peso: 4,  vel: [80, 120] },
    { emoji: "🐬", nombre: "Delfín",       valor: 6, peso: 2,  vel: [110, 150] },
  ],
  basura: ["🥾", "🥫", "🌿"],

  // -------- RECETAS para la Cocina Mágica --------
  // pasos: ingrediente, nombre y cantidad (cuenta + orden + lectura)
  recetas: [
    {
      id: "cupcake", nombre: "Cupcake de Pelu", emoji: "🧁",
      pasos: [
        { ing: "🌾", nombre: "harina", cant: 2 },
        { ing: "🥚", nombre: "huevos", cant: 3 },
        { ing: "🧈", nombre: "mantequilla", cant: 1 },
        { ing: "🍬", nombre: "azúcar", cant: 2 },
      ],
      distractores: ["🧂", "🍋", "🧄"],
      toppings: ["🍓", "🍫", "🌈", "⭐", "🫐", "🍒"],
    },
    {
      id: "pizza", nombre: "Pizza Feliz", emoji: "🍕",
      pasos: [
        { ing: "🫓", nombre: "masa", cant: 1 },
        { ing: "🍅", nombre: "tomate", cant: 3 },
        { ing: "🧀", nombre: "queso", cant: 2 },
        { ing: "🍄", nombre: "champiñones", cant: 4 },
      ],
      distractores: ["🍬", "🍫", "🍌"],
      toppings: ["🫒", "🌶️", "🥓", "🌿", "🌽", "🧅"],
    },
    {
      id: "jugo", nombre: "Jugo Arcoíris", emoji: "🥤",
      pasos: [
        { ing: "🍌", nombre: "plátano", cant: 1 },
        { ing: "🍓", nombre: "frutillas", cant: 4 },
        { ing: "🥛", nombre: "leche", cant: 2 },
        { ing: "🍯", nombre: "miel", cant: 1 },
      ],
      distractores: ["🧀", "🧄", "🌶️"],
      toppings: ["🍒", "🥝", "🍍", "🫐", "🥥", "🍊"],
    },
  ],

  // -------- Palabras en INGLÉS (para la aventura del cofre) --------
  palabrasIngles: [
    { emoji: "🐱", es: "gato",    en: "cat" },
    { emoji: "🐶", es: "perro",   en: "dog" },
    { emoji: "🌳", es: "árbol",   en: "tree" },
    { emoji: "⭐", es: "estrella",en: "star" },
    { emoji: "🌸", es: "flor",    en: "flower" },
    { emoji: "🏠", es: "casa",    en: "house" },
    { emoji: "☀️", es: "sol",     en: "sun" },
    { emoji: "🐟", es: "pez",     en: "fish" },
    { emoji: "🎈", es: "globo",   en: "balloon" },
    { emoji: "📖", es: "libro",   en: "book" },
  ],

  // -------- Frases en INGLÉS (para niñas más grandes: traducir) --------
  frasesIngles: [
    { es: "El gato es blanco.",        en: "The cat is white.",      distractores: ["The cat is black.", "The dog is white."] },
    { es: "Me gusta jugar.",           en: "I like to play.",        distractores: ["I like to eat.", "You like to play."] },
    { es: "¿Dónde está mi sombrero?",  en: "Where is my hat?",       distractores: ["Where is my bag?", "What is my hat?"] },
    { es: "Tengo dos amigos.",         en: "I have two friends.",    distractores: ["I have two flowers.", "I am two friends."] },
    { es: "Vamos a la playa.",         en: "Let's go to the beach.", distractores: ["Let's go to the forest.", "Let's eat at the beach."] },
    { es: "El sol es amarillo.",       en: "The sun is yellow.",     distractores: ["The sun is blue.", "The moon is yellow."] },
    { es: "Quiero una manzana.",       en: "I want an apple.",       distractores: ["I want a banana.", "I have an apple."] },
    { es: "Hoy estoy feliz.",          en: "Today I am happy.",      distractores: ["Today I am sad.", "Yesterday I am happy."] },
  ],

  // -------- Frases de ánimo (confianza y cariño) --------
  animos: [
    "¡Lo hiciste increíble, Pelu está feliz! 🌟",
    "¡Wow, qué lista eres! 💖",
    "¡Pelu salta de alegría! 🐱✨",
    "¡Cada vez mejor! Sigue así 🌈",
    "¡Eres una gran exploradora! 🧭",
  ],
  consuelos: [
    "Casi casi… ¡intentar es lo más valiente! 💪",
    "No pasa nada, los errores nos enseñan 🌱",
    "Pelu igual te quiere. ¡Probemos otra vez! 💗",
  ],
};
