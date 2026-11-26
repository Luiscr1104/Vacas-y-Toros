# 🐄🐂 Vacas y Toros

<div align="center">

![Version](https://img.shields.io/badge/version-0.0.1-blue)
![Astro](https://img.shields.io/badge/Astro-7.4-purple)
![React](https://img.shields.io/badge/React-19.3-cyan)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-teal)

**¿Puedes adivinar el número secreto?**

Un juego de lógica y deducción donde cada intento te acerca más a la verdad.

[🎮 Jugar Ahora](#-inicio-rápido) • [📖 Reglas](#-cómo-se-juega) • [🚀 Desarrollo](#-desarrollo)

</div>

---

## 📖 Descripción

**Vacas y Toros** es una implementación moderna del clásico juego de lógica (también conocido como *Bulls and Cows* o *Mastermind numérico*). Tu objetivo es adivinar un número secreto de 4 dígitos únicos utilizando la menor cantidad de intentos posibles.

### ✨ Características

- 🎮 **Modo Solo**: Desafía a la computadora y mejora tu tiempo
- ⚔️ **Modo VS**: Duelos por turnos con árbitro en el servidor y salas guardadas en MongoDB
- 🏆 **Salón de la Fama**: Compite por el primer lugar en el ranking global
- 🎨 **Estética cartoon**: Personajes vectoriales originales, colores cálidos y un tablero táctil
- 📱 **Responsive**: Juega desde cualquier dispositivo
- 🔊 **Efectos de Sonido**: Audio sintetizado localmente, sin descargar archivos externos
- 🕵️ **Tutorial interactivo** y libreta para descartar dígitos
- 📊 **Récords locales**: Partidas resueltas, mejores intentos y mejor tiempo en este navegador
- 🌐 **Partidas recuperables**: Recarga y vuelve con el mismo enlace y navegador
- 🤝 **Revanchas reales**: Ambos aceptan, se conservan las victorias y se alterna quién empieza

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

- **Node.js** 24.13+ (rama 24 LTS recomendada)
- **npm**; `package-lock.json` es el lockfile actualizado de esta versión

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Luiscr1104/Vacas-y-Toros.git

# Navegar al directorio
cd Vacas-y-Toros

# Instalar dependencias
npm ci

# Iniciar servidor de desarrollo
npm run dev
```

El juego estará disponible en **http://localhost:4321** 🎉

El modo individual no necesita una base de datos. Para habilitar **VS y los resultados
globales**, copia `.env.example` a `.env` y configura:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=vacas-y-toros
```

También puedes usar una URI de MongoDB Atlas. La aplicación crea los índices
necesarios; el usuario de MongoDB necesita permisos de lectura, escritura y creación
de índices en esa base de datos. No uses un prefijo `PUBLIC_` para estas variables.
Si MongoDB no está disponible, el modo individual y sus récords locales siguen funcionando.

Esta actualización usa npm y su configuración de `overrides`. Si migras a pnpm,
regenera su lockfile y traduce el override; no uses un lockfile antiguo para desplegar.

Los récords locales dependen del almacenamiento del navegador; no se sincronizan
entre dispositivos. Las tipografías se cargan desde Google Fonts y tienen fuentes
de respaldo si no hay conexión.

---

## 🛠️ Desarrollo

### Scripts Disponibles

| Comando | Acción |
|---------|--------|
| `npm install` | Instala las dependencias |
| `npm run dev` | Inicia el servidor de desarrollo en `localhost:4321` |
| `npm run build` | Construye la versión de producción en `./dist/` |
| `npm run preview` | Previsualiza la build antes de desplegar |
| `npm test` | Ejecuta pruebas de reglas, generación de códigos y récords locales |
| `npm run check` | Comprueba los tipos de TypeScript |
| `npm run test:integration` | Prueba concurrencia y persistencia con un MongoDB temporal |
| `npm run test:e2e` | Prueba dos navegadores, reconexión, respuestas perdidas y revanchas |
| `npm audit` | Comprueba alertas de dependencias |

Las pruebas de integración y navegador usan `mongodb-memory-server-core`, **nunca la base
de datos configurada en `.env`**. La primera ejecución puede descargar un binario de
MongoDB al ejecutar las pruebas, no durante la instalación o el despliegue;
no necesita Docker. Para las pruebas de navegador, instala Chromium una vez:

```bash
npx playwright install chromium
npm run test:e2e
```

### Dependencias y seguridad

Se actualizaron Astro, React, el adaptador de Vercel, Tailwind y MongoDB. PeerJS se
eliminó: el VS ya no usa WebRTC. El override de `path-to-regexp` a **6.3.0** afecta
solo a `@vercel/routing-utils`, que todavía fija una versión vulnerable de la misma
rama mayor. La compilación de Vercel y las rutas de la aplicación se prueban con
esta resolución. Revisa el override cuando el adaptador corrija esa dependencia.

### Tecnologías Utilizadas

- **[Astro](https://astro.build)** - Framework web moderno
- **[React](https://react.dev)** - Librería de UI
- **[TailwindCSS](https://tailwindcss.com)** - Framework de estilos
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[MongoDB](https://www.mongodb.com/)** - Salas persistentes, resultados y límites de peticiones
- **Web Audio API** - Efectos de sonido locales
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
│   │   ├── Versus.tsx       # API, sincronización y recuperación del VS
│   │   ├── VSLobby.tsx      # Crear sala o entrar con código
│   │   └── VSGame.tsx       # Juego en modo VS
│   ├── lib/
│   │   ├── audio.ts         # Sistema de audio
│   │   └── server/          # Reglas del duelo, persistencia y seguridad HTTP
│   ├── pages/
│   │   ├── index.astro      # Página principal
│   │   └── api/
│   │       ├── rooms/       # Crear, entrar, recuperar y jugar
│   │       └── scores.ts    # Récords solo y resultados VS separados
│   └── styles/
│       └── global.css       # Estilos globales
├── tests/                   # Unitarias, integración y navegador
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

- Crea una sala y comparte su enlace o código de 8 caracteres
- Cada jugador elige un número secreto; el servidor calcula las pistas
- El primer turno se sortea; después, los jugadores alternan
- Gana quien descifre el código del rival en su turno
- Reintentar una jugada no la aplica dos veces, ni siquiera con respuestas perdidas
- Recupera la partida al recargar con el mismo navegador y sus cookies
- Pide revancha: ambos deben aceptar y cambia quién empieza
- La sala caduca tras 30 minutos sin actividad, con un máximo absoluto de 24 horas
- Tras 90 segundos sin señal del rival puedes cerrar por ausencia; los abandonos
  no generan resultados públicos verificados

El cliente consulta los cambios cada 1,8 segundos, sin solicitudes solapadas.
Al ocultar la pestaña se pausa la consulta y al volver se recupera el estado.
Las interrupciones temporales usan reintentos con espera creciente. Si vas a
estar en segundo plano más de 90 segundos, tu rival podría declarar el abandono.

---

## 🏆 Sistema de Rankings

Hay dos vistas independientes:

- **Individual:** top 10 por intentos y luego tiempo. Estos resultados se declaran
  desde el navegador y se identifican como **no verificados**.
- **VS:** los últimos 10 duelos resueltos, guardados automáticamente por el servidor,
  con ganador, rival, intentos y duración. No es una clasificación Elo ni una tabla
  de cuentas: los apodos no son identidades únicas.

`POST /api/scores` solo admite resultados individuales. Los antiguos récords VS
en `scores` no se borran, pero dejan de mostrarse como resultados verificados.

### Privacidad y consistencia del VS

- Cookie de sesión `HttpOnly`, `SameSite=Lax` y `Secure` en producción; sin credenciales
  en los enlaces. Cada sala guarda únicamente el hash de la credencial.
- La respuesta pública excluye secretos y hashes hasta el final de la ronda.
  Los secretos se guardan en la base de datos del servidor, nunca en los logs.
- Cambios atómicos mediante revisión del documento, comprobación de turno,
  validación de mensajes, identificadores de acción y rechazo de rondas antiguas.
- Protección de origen en las escrituras, límite de 2 KiB por petición y límites
  persistentes para crear, entrar, jugar y consultar.
- Índices TTL limpian salas y contadores. La API comprueba igualmente la caducidad:
  no depende del momento en que MongoDB elimine el documento.
- Un resultado se guarda con identificador único por sala/ronda. Si la escritura
  falla después de confirmar la victoria, una lectura o reintento lo recupera antes
  de permitir una revancha.

---

## 🎨 Características de Diseño

- **Cartoon arcade**: Vaca y toro dibujados en SVG, paisaje ilustrado y botones con relieve
- **Paleta cálida**: Crema, tinta verde oscuro, coral y amarillo maíz
- **Tablero táctil**: Cuatro casillas, teclado propio e historial de pistas agregadas
- **Accesibilidad**: Etiquetas, avisos de resultados, foco visible y respeto por movimiento reducido
- **Responsive**: Inicio y partidas individual/VS adaptadas a móvil y escritorio
- **Modo VS cartoon**: Personajes, marcador de rondas, estados de conexión, teclado y libreta

### Pendientes técnicos

- Los récords individuales siguen siendo declarados por el cliente.
- Un VS arbitrado evita falsificar pistas o turnos, pero no evita bots, colaboración
  entre jugadores o abuso de apodos. El modo es casual, no un sistema competitivo con cuentas.
- La libreta de notas del VS es privada y temporal; se reinicia al recargar o cambiar de ronda.
- A mayor concurrencia conviene medir el coste de las consultas y evaluar notificaciones
  por WebSocket mediante un servicio de salas dedicado.

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
Configura Node.js 24 y las variables `MONGODB_URI` / `MONGODB_DB` en Vercel antes
de desplegar. No hace falta alojar un servidor WebSocket ni habilitar MongoDB
Change Streams. Usa HTTPS para proteger las cookies y los códigos secretos.

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

**Luis Roberto**
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
