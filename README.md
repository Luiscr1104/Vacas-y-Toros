# 🐄🐂 Vacas y Toros

<div align="center">

![Version](https://img.shields.io/badge/version-0.0.1-blue)
![Astro](https://img.shields.io/badge/Astro-5.16-purple)
![React](https://img.shields.io/badge/React-19.2-cyan)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-teal)

**¿Puedes adivinar el número secreto?**

Un juego de lógica y deducción donde cada intento te acerca más a la verdad.

[🎮 Jugar Ahora](#-inicio-rápido) • [📖 Reglas](#-cómo-se-juega) • [🚀 Desarrollo](#-desarrollo)

</div>

---

## 📖 Descripción

**Vacas y Toros** es una implementación moderna del clásico juego de lógica (también conocido como *Bulls and Cows* o *Mastermind numérico*). Tu objetivo es adivinar un número secreto de 4 dígitos únicos utilizando la menor cantidad de intentos posibles.

### ✨ Características

- 🎮 **Modo Solo**: Desafía a la computadora y mejora tu tiempo
- ⚔️ **Modo VS**: Compite en tiempo real contra otros jugadores usando WebRTC
- 🏆 **Salón de la Fama**: Compite por el primer lugar en el ranking global
- 🎨 **Diseño Moderno**: UI con glassmorphism, gradientes y animaciones fluidas
- 📱 **Responsive**: Juega desde cualquier dispositivo
- 🔊 **Efectos de Sonido**: Feedback auditivo para cada acción (usando Howler.js)
- 🌐 **Multijugador P2P**: Conexiones peer-to-peer sin servidor central (usando PeerJS)

---

## 🎯 Cómo se Juega

### Objetivo
Adivina el número secreto de **4 dígitos únicos** (del 0 al 9) en la menor cantidad de intentos.

### Sistema de Pistas

Cada vez que hagas un intento, recibirás pistas en forma de:

| Emoji | Nombre | Significado |
|-------|--------|-------------|
| 🐂 | **Toro** | Dígito correcto en la posición **correcta** |
| 🐄 | **Vaca** | Dígito correcto en la posición **incorrecta** |

#### 📝 Ejemplo

Si el número secreto es **`1234`** y tu intento es **`1478`**:

- El **1** está en la posición correcta → **1 Toro** 🐂
- El **4** existe pero está en la posición incorrecta → **1 Vaca** 🐄

**Resultado: 1🐂 1🐄**

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 18+ 
- **npm** o **pnpm**

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Luiscr1104/Vacas-y-Toros.git

# Navegar al directorio
cd "Vacas y Toros"

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El juego estará disponible en **http://localhost:4321** 🎉

---

## 🛠️ Desarrollo

### Scripts Disponibles

| Comando | Acción |
|---------|--------|
| `npm install` | Instala las dependencias |
| `npm run dev` | Inicia el servidor de desarrollo en `localhost:4321` |
| `npm run build` | Construye la versión de producción en `./dist/` |
| `npm run preview` | Previsualiza la build antes de desplegar |

### Tecnologías Utilizadas

- **[Astro](https://astro.build)** - Framework web moderno
- **[React](https://react.dev)** - Librería de UI
- **[TailwindCSS](https://tailwindcss.com)** - Framework de estilos
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[MongoDB](https://www.mongodb.com/)** - Base de datos para el ranking
- **[PeerJS](https://peerjs.com/)** - WebRTC simplificado para el modo VS
- **[Howler.js](https://howlerjs.com/)** - Gestión de audio
- **[Vercel](https://vercel.com)** - Hosting y despliegue

---

## 📂 Estructura del Proyecto

```
/
├── public/
│   └── favicon.svg          # Icono del sitio
├── src/
│   ├── components/
│   │   ├── App.tsx          # Componente principal
│   │   ├── MainMenu.tsx     # Menú principal y selector de modo
│   │   ├── Game.tsx         # Juego en modo solo
│   │   ├── VSLobby.tsx      # Sala de espera para modo VS
│   │   └── VSGame.tsx       # Juego en modo VS
│   ├── lib/
│   │   └── audio.ts         # Sistema de audio
│   ├── pages/
│   │   ├── index.astro      # Página principal
│   │   └── api/
│   │       └── scores.ts    # API para el ranking
│   └── styles/
│       └── global.css       # Estilos globales
├── astro.config.mjs         # Configuración de Astro
├── package.json             # Dependencias del proyecto
└── tsconfig.json            # Configuración de TypeScript
```

---

## 🎮 Modos de Juego

### 🎯 Modo Solo

- Juega contra la computadora
- Desafía tus mejores tiempos
- Compite en el ranking global
- Perfecto para practicar estrategias

### ⚔️ Modo VS

- Desafía a un amigo en tiempo real
- Conexión P2P sin servidor central
- Gana quien adivine primero
- Cada jugador tiene su propio número secreto

---

## 🏆 Sistema de Rankings

Los mejores puntajes se almacenan en una base de datos MongoDB y se clasifican por:

1. **Número de intentos** (menos es mejor)
2. **Tiempo total** (más rápido es mejor)

El ranking muestra el **Top 10 Global** con:
- 🥇 Posición en el leaderboard
- 👤 Nombre del jugador
- 🎯 Cantidad de intentos
- ⏱️ Tiempo total

---

## 🎨 Características de Diseño

- **Glassmorphism**: Efectos de vidrio esmerilado para un look moderno
- **Gradientes Vibrantes**: Paleta de colores llamativa (pink, purple, indigo)
- **Animaciones Fluidas**: Transiciones suaves y micro-interacciones
- **Dark Mode**: Diseño optimizado para ambientes oscuros
- **Responsive Design**: Adaptado para móviles, tablets y desktop
- **Accesibilidad**: Contraste adecuado y feedback visual claro

---

## 🔊 Sistema de Audio

El juego incluye efectos de sonido para:
- ✅ Aciertos
- ❌ Errores
- 🎉 Victoria
- 🔘 Clicks y navegación

**Nota**: Los sonidos se pueden silenciar desde los controles del juego.

---

## 🌐 Despliegue

El proyecto está configurado para desplegarse en **Vercel**:

```bash
# Build de producción
npm run build

# O despliega directamente con Vercel CLI
vercel
```

La configuración SSR está lista con el adaptador `@astrojs/vercel`.

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar el juego:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 👤 Autor

**Luis Rodriguez**
- GitHub: [@Luiscr1104](https://github.com/Luiscr1104)

---

## 🙏 Agradecimientos

- Inspirado en el clásico juego "Bulls and Cows"
- Construido con las últimas tecnologías web
- Agradecimientos a la comunidad de Astro y React

---

<div align="center">

**¿Listo para el desafío?** 

[🎮 ¡Juega Ahora!](https://vacas-y-toros.vercel.app)

</div>
