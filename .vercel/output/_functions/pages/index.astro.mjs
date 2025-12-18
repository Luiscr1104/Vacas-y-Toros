import { e as createComponent, f as createAstro, h as addAttribute, k as renderHead, l as renderComponent, r as renderTemplate } from '../chunks/astro/server_B_TnjHmk.mjs';
import 'piccolore';
import { jsx, jsxs } from 'react/jsx-runtime';
import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

function MainMenu({ onStartGame }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch("/api/scores");
        if (response.ok) {
          const data = await response.json();
          setScores(data);
        }
      } catch (e) {
        console.error("Error fetching scores:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);
  return /* @__PURE__ */ jsx("div", { className: "w-full max-w-2xl mx-auto p-4 sm:p-8 perspective-1000", children: /* @__PURE__ */ jsxs("div", { className: "relative bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-12 shadow-2xl border border-white/20 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-10 left-10 text-6xl opacity-10 animate-bounce", children: "🐂" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-10 right-10 text-6xl opacity-10 animate-bounce", style: { animationDelay: "0.5s" }, children: "🐄" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 text-center space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-5xl sm:text-7xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2 sm:mb-4 animate-in fade-in zoom-in-50 duration-700 leading-tight", children: "VACAS Y TOROS" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg sm:text-xl text-blue-200 font-medium tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-700", style: { animationDelay: "0.2s" }, children: "¿Puedes adivinar el número?" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700", style: { animationDelay: "0.4s" }, children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg sm:text-xl font-bold text-white/90", children: "¿Cómo jugar?" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-black/40 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-row sm:flex-col items-center gap-4 sm:gap-3 transition-transform hover:scale-105 group text-left sm:text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-4xl group-hover:animate-bounce shrink-0", children: "🐂" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-black text-green-400 uppercase tracking-widest text-xs sm:text-sm mb-1", children: "Toro" }),
              /* @__PURE__ */ jsxs("p", { className: "text-[11px] sm:text-xs text-white/60 leading-tight", children: [
                "Dígito correcto en posición ",
                /* @__PURE__ */ jsx("strong", { children: "correcta" }),
                "."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-black/40 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-row sm:flex-col items-center gap-4 sm:gap-3 transition-transform hover:scale-105 group text-left sm:text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-4xl group-hover:animate-bounce shrink-0", children: "🐄" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-black text-yellow-400 uppercase tracking-widest text-xs sm:text-sm mb-1", children: "Vaca" }),
              /* @__PURE__ */ jsxs("p", { className: "text-[11px] sm:text-xs text-white/60 leading-tight", children: [
                "Dígito correcto en posición ",
                /* @__PURE__ */ jsx("strong", { children: "incorrecta" }),
                "."
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/5 border border-white/10 rounded-2xl p-4 text-left", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-blue-200/60 uppercase tracking-widest font-bold mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" }),
            "Ejemplo Rápido"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-sm font-mono tracking-wider", children: [
              /* @__PURE__ */ jsx("span", { className: "text-white/40", children: "Secreto:" }),
              /* @__PURE__ */ jsx("span", { className: "text-white", children: "1 2 3 4" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-sm font-mono tracking-wider", children: [
              /* @__PURE__ */ jsx("span", { className: "text-white/40", children: "Tu intento:" }),
              /* @__PURE__ */ jsx("span", { className: "text-white", children: "1 4 7 8" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-px bg-white/10 my-1" }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center font-bold", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-white/40", children: "Resultado:" }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
                /* @__PURE__ */ jsx("span", { className: "text-green-300", children: "1 🐂" }),
                /* @__PURE__ */ jsx("span", { className: "text-yellow-300", children: "1 🐄" })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-50 duration-700", style: { animationDelay: "0.6s" }, children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => onStartGame("solo"),
            className: "group relative p-4 sm:p-6 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border-2 border-purple-400/30 hover:border-purple-400/60 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 active:scale-95",
            children: [
              /* @__PURE__ */ jsx("div", { className: "text-4xl sm:text-5xl mb-2 sm:mb-3 text-center", children: "🎮" }),
              /* @__PURE__ */ jsx("h3", { className: "text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 text-center", children: "Solo" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-white/60 text-center", children: "Juega contra la computadora" }),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => onStartGame("vs"),
            className: "group relative p-4 sm:p-6 bg-gradient-to-br from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30 border-2 border-pink-400/30 hover:border-pink-400/60 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/30 active:scale-95",
            children: [
              /* @__PURE__ */ jsx("div", { className: "text-4xl sm:text-5xl mb-2 sm:mb-3 text-center", children: "⚔️" }),
              /* @__PURE__ */ jsx("h3", { className: "text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 text-center", children: "Modo VS" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm text-white/60 text-center", children: "Juega contra otro jugador" }),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-12 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000", style: { animationDelay: "0.8s" }, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-2", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-xl font-black text-white/90 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🏆" }),
            " Hall of Fame"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-white/30 uppercase tracking-widest font-bold", children: "Top 10 Global" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-inner shadow-black/40", children: loading ? /* @__PURE__ */ jsx("div", { className: "p-8 flex justify-center", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" }) }) : scores.length === 0 ? /* @__PURE__ */ jsx("p", { className: "p-8 text-white/40 italic text-sm", children: "Sé el primero en aparecer aquí..." }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-white/5", children: scores.map((score, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 hover:bg-white/5 transition-colors", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxs("span", { className: `w-6 text-sm font-black ${index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-300" : index === 2 ? "text-amber-600" : "text-white/20"}`, children: [
              "#",
              index + 1
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-white font-bold text-sm tracking-wide", children: score.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4 text-xs font-mono", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-purple-300", children: [
              score.attempts,
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-[10px] opacity-60", children: "pasos" })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-blue-300", children: [
              score.time,
              "s"
            ] })
          ] })
        ] }, index)) }) })
      ] })
    ] })
  ] }) });
}

function Game({ onBack }) {
  const [secret, setSecret] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("playing");
  const [error, setError] = useState("");
  const [scratchpad, setScratchpad] = useState({});
  const [startTime, setStartTime] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [playerName, setPlayerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    startNewGame();
  }, []);
  const generateSecret = () => {
    let numbers = Array.from({ length: 10 }, (_, i) => i.toString());
    let result = "";
    for (let i = 0; i < 4; i++) {
      const index = Math.floor(Math.random() * numbers.length);
      result += numbers[index];
      numbers.splice(index, 1);
    }
    return result;
  };
  const startNewGame = () => {
    setSecret(generateSecret());
    setGuesses([]);
    setStatus("playing");
    setInput("");
    setError("");
    setScratchpad({});
    setStartTime(Date.now());
    setGameTime(0);
    setSubmitted(false);
    setPlayerName("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  const calculateBullsCows = (guess, target) => {
    let bulls = 0;
    let cows = 0;
    for (let i = 0; i < 4; i++) {
      if (guess[i] === target[i]) {
        bulls++;
      } else if (target.includes(guess[i])) {
        cows++;
      }
    }
    return { bulls, cows };
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (status === "won") return;
    if (input.length !== 4) {
      setError("Must be 4 digits");
      return;
    }
    if (!/^\d+$/.test(input)) {
      setError("Numbers only");
      return;
    }
    if (new Set(input).size !== 4) {
      setError("Digits must be unique");
      return;
    }
    const { bulls, cows } = calculateBullsCows(input, secret);
    const newGuess = { number: input, bulls, cows };
    setGuesses([newGuess, ...guesses]);
    setInput("");
    if (bulls === 4) {
      setStatus("won");
      const duration = Math.floor((Date.now() - startTime) / 1e3);
      setGameTime(duration);
    }
  };
  const submitScore = async () => {
    if (!playerName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: playerName.trim(),
          attempts: guesses.length + 1,
          // Current guess counts too
          time: gameTime,
          mode: "solo"
        })
      });
      if (response.ok) {
        setSubmitted(true);
      }
    } catch (e) {
      console.error("Error submitting score:", e);
    } finally {
      setIsSubmitting(false);
    }
  };
  const toggleScratch = (digit) => {
    setScratchpad((prev) => ({
      ...prev,
      [digit]: !prev[digit]
    }));
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-4xl mx-auto p-4 perspective-1000 flex flex-col md:flex-row gap-8 items-start justify-center", children: [
    /* @__PURE__ */ jsxs("div", { className: `flex-1 w-full max-w-md relative bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 overflow-hidden transition-all duration-500 transform ${status === "won" ? "scale-105 border-green-400/50 shadow-green-500/20" : ""}`, children: [
      onBack && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onBack,
          className: "absolute top-4 left-4 text-white/30 hover:text-white transition-colors z-10",
          children: "← Menu"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-4xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2", children: "VACAS Y TOROS" }),
        /* @__PURE__ */ jsx("p", { className: "text-blue-200 text-sm font-medium tracking-wide uppercase opacity-80", children: "Guess the 4-digit number" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "relative group", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: inputRef,
              type: "text",
              maxLength: 4,
              value: input,
              onChange: (e) => {
                if (e.target.value.length <= 4) setInput(e.target.value);
                setError("");
              },
              placeholder: "Type 4 unique digits...",
              disabled: status === "won",
              inputMode: "numeric",
              pattern: "[0-9]*",
              className: "w-full bg-black/20 text-white text-center text-3xl tracking-[1em] font-mono py-4 rounded-2xl border-2 border-white/10 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20 outline-none transition-all duration-300 placeholder:text-white/10 placeholder:tracking-normal placeholder:text-lg hover:border-white/20"
            }
          ),
          error && /* @__PURE__ */ jsx("div", { className: "absolute -bottom-6 left-0 right-0 text-center text-red-400 text-sm font-bold animate-bounce", children: error }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: status === "won" || input.length !== 4,
              className: "absolute right-2 top-2 bottom-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale shadow-lg shadow-purple-500/30 flex items-center justify-center",
              children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "4", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ jsx("path", { d: "M5 12h14" }),
                /* @__PURE__ */ jsx("path", { d: "m12 5 7 7-7 7" })
              ] })
            }
          )
        ] }),
        status === "won" && /* @__PURE__ */ jsxs("div", { className: "text-center py-6 animate-in zoom-in-50 duration-500", children: [
          /* @__PURE__ */ jsx("div", { className: "text-6xl mb-2 animate-bounce", children: "🏆" }),
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-green-300", children: "¡Lo lograste!" }),
          /* @__PURE__ */ jsxs("p", { className: "text-white/60 mb-4", children: [
            "Número: ",
            /* @__PURE__ */ jsx("span", { className: "text-white font-mono font-bold tracking-widest", children: secret })
          ] }),
          !submitted ? /* @__PURE__ */ jsxs("div", { className: "bg-black/30 rounded-2xl p-4 mb-6 border border-white/10 space-y-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-purple-300 font-bold", children: "Hall of Fame" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: playerName,
                  onChange: (e) => setPlayerName(e.target.value),
                  placeholder: "Tu nombre...",
                  maxLength: 15,
                  className: "bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-center outline-none focus:border-purple-400 transition-all text-sm"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: submitScore,
                  disabled: !playerName.trim() || isSubmitting,
                  className: "w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-bold text-sm shadow-lg shadow-purple-500/20 disabled:opacity-50",
                  children: isSubmitting ? "Guardando..." : "Guardar Récord"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-white/40 italic", children: [
              guesses.length,
              " intentos en ",
              gameTime,
              " segundos"
            ] })
          ] }) : /* @__PURE__ */ jsx("div", { className: "bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-6 animate-in slide-in-from-bottom-2", children: /* @__PURE__ */ jsx("p", { className: "text-green-300 text-sm font-bold", children: "✨ ¡Guardado en el Hall of Fame!" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: startNewGame,
                className: "px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 rounded-full text-sm font-bold transition-all duration-300 border border-green-400/30 hover:border-green-400/50 hover:scale-105 active:scale-95 shadow-lg shadow-green-500/10",
                children: "🎮 Jugar de Nuevo"
              }
            ),
            onBack && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onBack,
                className: "px-6 py-2 text-white/40 hover:text-white transition-colors text-xs font-bold",
                children: "Salir al Menú"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar", children: guesses.map((g, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 hover:border-white/20 hover:bg-black/30 hover:scale-[1.02] transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 zoom-in-50 fill-mode-backwards cursor-default", style: { animationDelay: `${i * 50}ms` }, children: [
          /* @__PURE__ */ jsx("span", { className: "text-2xl font-mono tracking-widest text-white/90", children: g.number }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-6", children: [
            /* @__PURE__ */ jsxs("div", { className: `flex flex-col items-center gap-1 transition-all duration-300 ${g.bulls > 0 ? "scale-125" : ""}`, children: [
              /* @__PURE__ */ jsxs("div", { className: `relative ${g.bulls > 0 ? "animate-pulse" : ""}`, children: [
                /* @__PURE__ */ jsx("span", { className: "text-3xl drop-shadow-lg", children: "🐂" }),
                g.bulls > 0 && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-green-500/30 blur-xl rounded-full" })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: `text-sm font-bold transition-all ${g.bulls > 0 ? "text-green-300 scale-110" : "text-green-400/40"}`, children: [
                g.bulls,
                " Toros"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: `flex flex-col items-center gap-1 transition-all duration-300 ${g.cows > 0 ? "scale-125" : ""}`, children: [
              /* @__PURE__ */ jsxs("div", { className: `relative ${g.cows > 0 ? "animate-pulse" : ""}`, children: [
                /* @__PURE__ */ jsx("span", { className: "text-3xl drop-shadow-lg", children: "🐄" }),
                g.cows > 0 && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-yellow-500/30 blur-xl rounded-full" })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: `text-sm font-bold transition-all ${g.cows > 0 ? "text-yellow-300 scale-110" : "text-yellow-400/40"}`, children: [
                g.cows,
                " Vacas"
              ] })
            ] })
          ] })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 text-center text-white/30 text-xs", children: [
        /* @__PURE__ */ jsx("p", { children: "🐂 Toro: Right digit, right place" }),
        /* @__PURE__ */ jsx("p", { children: "🐄 Vaca: Right digit, wrong place" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold text-center md:rotate-90 md:mb-8 whitespace-nowrap", children: "Descartar números" }),
      /* @__PURE__ */ jsx("div", { className: "w-full md:w-24 bg-white/5 backdrop-blur-sm rounded-3xl p-4 border border-white/10 flex flex-row md:flex-col gap-3 items-center justify-center flex-wrap shrink-0 shadow-inner shadow-black/20", children: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => toggleScratch(digit),
          className: `w-12 h-12 rounded-full font-mono font-bold text-xl transition-all duration-300 border relative overflow-hidden group hover:shadow-lg hover:shadow-purple-500/20 active:scale-90 ${scratchpad[digit] ? "bg-red-500/10 text-white/20 border-red-500/20 scale-95 grayscale" : "bg-gradient-to-br from-white/10 to-white/5 text-white border-white/10 hover:border-purple-400/50 hover:scale-110 hover:-translate-y-1"}`,
          children: [
            digit,
            /* @__PURE__ */ jsxs("div", { className: `absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${scratchpad[digit] ? "opacity-100" : "opacity-0"}`, children: [
              /* @__PURE__ */ jsx("div", { className: "w-[120%] h-1 bg-red-500/60 rotate-45 transform origin-center shadow-sm" }),
              /* @__PURE__ */ jsx("div", { className: "absolute w-[120%] h-1 bg-red-500/60 -rotate-45 transform origin-center shadow-sm" })
            ] })
          ]
        },
        digit
      )) })
    ] })
  ] });
}

function VSLobby({ onGameStart, onBack }) {
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [connection, setConnection] = useState(null);
  const [status, setStatus] = useState("Inicializando...");
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinRoomId = params.get("room");
    const newPeer = new Peer();
    newPeer.on("open", (id) => {
      setPeerId(id);
      setPeer(newPeer);
      if (joinRoomId) {
        setRoomId(joinRoomId);
        setStatus("Conectando a la sala...");
        connectToRoom(newPeer, joinRoomId);
      } else {
        setIsHost(true);
        setStatus("Sala creada. Comparte el enlace con tu amigo.");
      }
    });
    newPeer.on("connection", (conn) => {
      console.log("Host: Received connection from guest");
      setConnection(conn);
      setStatus("¡Amigo conectado! Preparando juego...");
      conn.on("open", () => {
        console.log("Host: Connection is now open");
        setStatus("Conexión establecida. Verificando...");
        setTimeout(() => {
          console.log("Host: Verifying connection before starting game");
          console.log("Host: Connection.open =", conn.open);
          if (conn.open) {
            console.log("Host: Connection verified, starting game");
            onGameStart(newPeer, conn, true);
          } else {
            console.error("Host: Connection not open after delay!");
            setStatus("Error: Conexión perdida");
          }
        }, 1500);
      });
      conn.on("error", (err) => {
        console.error("Host connection error:", err);
        setStatus("Error de conexión");
      });
      conn.on("close", () => {
        console.log("Host: Connection closed");
        setStatus("Conexión cerrada");
      });
    });
    newPeer.on("error", (err) => {
      console.error("PeerJS error:", err);
      if (err.type === "peer-unavailable") {
        setStatus("Error: La sala ya no existe o el host se desconectó.");
      } else {
        setStatus(`Error: ${err.type}`);
      }
    });
    newPeer.on("disconnected", () => {
      console.log("Peer disconnected, attempting to reconnect...");
      setStatus("Conexión perdida. Intentando reconectar...");
      newPeer.reconnect();
    });
  }, []);
  const connectToRoom = (peerInstance, targetId) => {
    console.log("Guest: Connecting to room:", targetId);
    const conn = peerInstance.connect(targetId);
    conn.on("open", () => {
      console.log("Guest: Connection is now open");
      setConnection(conn);
      setStatus("¡Conectado! Verificando...");
      setTimeout(() => {
        console.log("Guest: Verifying connection before starting game");
        console.log("Guest: Connection.open =", conn.open);
        if (conn.open) {
          console.log("Guest: Connection verified, starting game");
          onGameStart(peerInstance, conn, false);
        } else {
          console.error("Guest: Connection not open after delay!");
          setStatus("Error: Conexión perdida");
        }
      }, 1500);
    });
    conn.on("error", (err) => {
      console.error("Guest connection error:", err);
      setStatus("Error al conectar. Verifica el enlace.");
    });
    conn.on("close", () => {
      console.log("Guest: Connection closed");
      setStatus("Conexión cerrada");
    });
  };
  const shareLink = () => {
    const link = shareUrl;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  const handleNativeShare = async () => {
    const shareData = {
      title: "Vacas y Toros - ¡Juega Conmigo!",
      text: "Únete a mi partida de Vacas y Toros.",
      url: shareUrl
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err);
          shareLink();
        }
      }
    } else {
      shareLink();
    }
  };
  const handleReconnect = () => {
    if (peer && peer.disconnected) {
      setStatus("Reconectando manualmente...");
      peer.reconnect();
    } else {
      window.location.reload();
    }
  };
  const shareUrl = `${window.location.origin}${window.location.pathname}?room=${peerId}`;
  return /* @__PURE__ */ jsx("div", { className: "w-full max-w-2xl mx-auto p-8", children: /* @__PURE__ */ jsxs("div", { className: "relative bg-white/10 backdrop-blur-md rounded-3xl p-12 shadow-2xl border border-white/20", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onBack,
        className: "absolute top-4 left-4 text-white/60 hover:text-white transition-colors",
        children: "← Volver"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "text-center space-y-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-4xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent", children: "Modo VS" }),
      /* @__PURE__ */ jsxs("div", { className: "bg-black/20 rounded-2xl p-6 border border-white/10", children: [
        /* @__PURE__ */ jsx("p", { className: "text-lg text-white/80", children: status }),
        status.includes("Error") && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleReconnect,
            className: "mt-4 text-xs text-purple-400 hover:text-purple-300 underline",
            children: "Reintentar / Recargar"
          }
        )
      ] }),
      isHost && peerId && !connection && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-black/30 rounded-xl p-4 border border-purple-400/30", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mb-2", children: "Enlace de Invitación:" }),
          /* @__PURE__ */ jsx("div", { className: "bg-black/40 rounded-lg p-3 font-mono text-sm text-purple-300 break-all", children: shareUrl })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3 justify-center", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleNativeShare,
              className: "flex-1 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2",
              children: /* @__PURE__ */ jsx("span", { children: "📤 Enviar por WhatsApp / Otros" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: shareLink,
              className: "px-6 py-3 bg-white/5 hover:bg-white/10 text-white/80 rounded-full border border-white/10 transition-all text-sm",
              children: copied ? "✓ Copiado" : "📋 Copiar"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/40", children: "Esperando a que tu amigo se conecte..." })
      ] }),
      !isHost && /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400" }) })
    ] })
  ] }) });
}

function VSGame({ peer, connection, isHost, onExit }) {
  const [mySecret, setMySecret] = useState("");
  const mySecretRef = useRef("");
  const [opponentSecret, setOpponentSecret] = useState("");
  const [myGuesses, setMyGuesses] = useState([]);
  const [opponentGuesses, setOpponentGuesses] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [gameState, setGameState] = useState("setup");
  const [isMyTurn, setIsMyTurn] = useState(isHost);
  const [setupReady, setSetupReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [connectionReady, setConnectionReady] = useState(false);
  const [scratchpad, setScratchpad] = useState({});
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef(null);
  const toggleScratch = (digit) => {
    setScratchpad((prev) => ({
      ...prev,
      [digit]: !prev[digit]
    }));
  };
  useEffect(() => {
    console.log("Setting up connection listener");
    console.log("Connection.open:", connection.open);
    const handleOpen = () => {
      console.log("Connection opened event fired!");
      setConnectionReady(true);
    };
    connection.on("open", handleOpen);
    const handleData = (data) => {
      console.log("Received data:", data);
      handleMessage(data);
    };
    connection.on("data", handleData);
    const handleDisconnect = () => {
      console.log("Peer disconnected from server, attempting reconnect...");
      peer.reconnect();
    };
    peer.on("disconnected", handleDisconnect);
    const timer = setTimeout(() => {
      setConnectionReady(true);
    }, 500);
    return () => {
      clearTimeout(timer);
      connection.off("open", handleOpen);
      connection.off("data", handleData);
      peer.off("disconnected", handleDisconnect);
    };
  }, [connection, peer]);
  useEffect(() => {
    if (gameState === "playing" && isMyTurn && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [gameState, isMyTurn]);
  useEffect(() => {
    if (setupReady && opponentReady && gameState === "setup") {
      console.log("Both players ready, transitioning to playing");
      setTimeout(() => setGameState("playing"), 500);
    }
  }, [setupReady, opponentReady, gameState]);
  const handleMessage = (data) => {
    switch (data.type) {
      case "secret_ready":
        console.log("Received secret_ready from opponent");
        setOpponentReady(true);
        if (setupReady) {
          console.log("Both ready, starting game");
          setGameState("playing");
        }
        break;
      case "guess":
        const result = calculateBullsCows(data.number, mySecretRef.current);
        setOpponentGuesses((prev) => [{
          number: data.number,
          bulls: result.bulls,
          cows: result.cows
        }, ...prev]);
        connection.send({
          type: "guess_result",
          bulls: result.bulls,
          cows: result.cows
        });
        if (result.bulls === 4) {
          setGameState("lost");
          connection.send({
            type: "reveal_secret",
            secret: mySecretRef.current
          });
        } else {
          setIsMyTurn(true);
        }
        break;
      case "guess_result":
        setMyGuesses((prev) => {
          const updated = [...prev];
          updated[0] = { ...updated[0], bulls: data.bulls, cows: data.cows };
          return updated;
        });
        if (data.bulls === 4) {
          setGameState("won");
          connection.send({
            type: "reveal_secret",
            secret: mySecretRef.current
          });
        } else {
          setIsMyTurn(false);
        }
        break;
      case "reveal_secret":
        setOpponentSecret(data.secret);
        break;
    }
  };
  const calculateBullsCows = (guess, target) => {
    let bulls = 0;
    let cows = 0;
    for (let i = 0; i < 4; i++) {
      if (guess[i] === target[i]) {
        bulls++;
      } else if (target.includes(guess[i])) {
        cows++;
      }
    }
    return { bulls, cows };
  };
  const handleSetSecret = () => {
    if (mySecret.length !== 4) {
      setError("Debe ser 4 dígitos");
      return;
    }
    if (!/^\d+$/.test(mySecret)) {
      setError("Solo números");
      return;
    }
    if (new Set(mySecret).size !== 4) {
      setError("Dígitos únicos");
      return;
    }
    if (!connectionReady) {
      setError("Esperando conexión...");
      console.log("Connection not ready yet");
      return;
    }
    console.log("Setting my secret, sending ready signal");
    console.log("Connection open?", connection.open);
    mySecretRef.current = mySecret;
    console.log("mySecretRef.current set to:", mySecretRef.current);
    setSetupReady(true);
    setError("");
    try {
      connection.send({ type: "secret_ready" });
      console.log("Sent secret_ready message");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };
  const handleGuess = (e) => {
    e.preventDefault();
    setError("");
    if (!isMyTurn) {
      setError("No es tu turno");
      return;
    }
    if (input.length !== 4 || !/^\d+$/.test(input) || new Set(input).size !== 4) {
      setError("Número inválido");
      return;
    }
    setMyGuesses((prev) => [{ number: input, bulls: 0, cows: 0 }, ...prev]);
    connection.send({
      type: "guess",
      number: input
    });
    setInput("");
  };
  if (gameState === "setup") {
    return /* @__PURE__ */ jsx("div", { className: "w-full max-w-md mx-auto p-8", children: /* @__PURE__ */ jsxs("div", { className: "bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 relative", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowHelp(true),
          className: "absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-all text-sm font-bold bg-white/5 rounded-full border border-white/10",
          children: "?"
        }
      ),
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent", children: "Elige tu Número Secreto" }),
      !connectionReady && /* @__PURE__ */ jsx("div", { className: "mb-4 bg-yellow-500/20 border border-yellow-400/40 rounded-xl p-3 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-yellow-300 text-sm", children: "⏳ Estableciendo conexión..." }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              maxLength: 4,
              value: mySecret,
              onChange: (e) => {
                setMySecret(e.target.value);
                setError("");
              },
              placeholder: "4 dígitos únicos",
              disabled: setupReady || !connectionReady,
              inputMode: "numeric",
              pattern: "[0-9]*",
              className: "w-full bg-black/20 text-white text-center text-3xl tracking-[1em] font-mono py-4 rounded-2xl border-2 border-white/10 focus:border-purple-400 outline-none transition-all disabled:opacity-50 placeholder:text-white/20 placeholder:tracking-normal placeholder:text-lg"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleSetSecret,
              disabled: setupReady || !connectionReady || mySecret.length !== 4,
              className: "absolute right-2 top-2 bottom-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-0 shadow-lg shadow-purple-500/30 flex items-center justify-center",
              children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "4", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ jsx("path", { d: "M5 12h14" }),
                /* @__PURE__ */ jsx("path", { d: "m12 5 7 7-7 7" })
              ] })
            }
          )
        ] }),
        error && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-sm text-center", children: error }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSetSecret,
            disabled: setupReady || !connectionReady,
            className: "w-full px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full transition-all disabled:opacity-50",
            children: setupReady ? "✓ Listo!" : "Confirmar"
          }
        ),
        setupReady && !opponentReady && /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
          /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400" }) }),
          /* @__PURE__ */ jsx("p", { className: "text-white/60 text-sm", children: "Esperando a tu oponente..." })
        ] }),
        setupReady && opponentReady && /* @__PURE__ */ jsx("div", { className: "bg-green-500/20 border border-green-400/40 rounded-xl p-4 text-center animate-pulse", children: /* @__PURE__ */ jsx("p", { className: "text-green-300 font-bold", children: "¡Ambos listos! Iniciando juego..." }) })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-4xl mx-auto p-4 relative", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onExit,
            className: "flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-bold bg-white/5 px-4 py-2 rounded-full hover:bg-white/10",
            children: "🏠 Menú Principal"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowHelp(true),
            className: "w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-all text-lg font-bold bg-white/5 rounded-full hover:bg-white/10 border border-white/10",
            title: "Cómo jugar",
            children: "?"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-white/20 text-xs font-mono uppercase tracking-widest", children: "Modo VS Online" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-xl font-bold text-center mb-4 text-purple-300", children: [
          "Tus Intentos ",
          isMyTurn && "(Tu turno)"
        ] }),
        gameState === "playing" && /* @__PURE__ */ jsxs("form", { onSubmit: handleGuess, className: "mb-4 relative group", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: inputRef,
              type: "text",
              maxLength: 4,
              value: input,
              onChange: (e) => setInput(e.target.value),
              disabled: !isMyTurn,
              placeholder: isMyTurn ? "Tu intento..." : "Espera tu turno",
              inputMode: "numeric",
              pattern: "[0-9]*",
              className: "w-full bg-black/20 text-white text-center text-2xl tracking-widest font-mono py-3 rounded-xl border-2 border-white/10 focus:border-purple-400 outline-none transition-all disabled:opacity-50 placeholder:text-white/20 placeholder:tracking-normal placeholder:text-lg"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: !isMyTurn || input.length !== 4,
              className: `absolute right-1.5 top-1.5 bottom-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg shadow-purple-500/30 ${!isMyTurn || input.length !== 4 ? "opacity-0 pointer-events-none" : "opacity-100"}`,
              children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "4", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ jsx("path", { d: "M5 12h14" }),
                /* @__PURE__ */ jsx("path", { d: "m12 5 7 7-7 7" })
              ] })
            }
          ),
          error && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-xs mt-1 absolute -bottom-5 left-0 right-0 text-center", children: error })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: myGuesses.map((g, i) => /* @__PURE__ */ jsxs("div", { className: "bg-black/20 p-3 rounded-xl flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "font-mono text-lg", children: g.number }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-3 text-sm", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-green-300", children: [
              "🐂 ",
              g.bulls
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-yellow-300", children: [
              "🐄 ",
              g.cows
            ] })
          ] })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-xl font-bold text-center mb-4 text-pink-300", children: [
          "Oponente ",
          !isMyTurn && "(Su turno)"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto mt-16", children: opponentGuesses.map((g, i) => /* @__PURE__ */ jsxs("div", { className: "bg-black/20 p-3 rounded-xl flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "font-mono text-lg", children: g.number }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-3 text-sm", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-green-300", children: [
              "🐂 ",
              g.bulls
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-yellow-300", children: [
              "🐄 ",
              g.cows
            ] })
          ] })
        ] }, i)) })
      ] })
    ] }),
    gameState === "playing" && /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-col gap-3 items-center", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold", children: "Descartar números" }),
      /* @__PURE__ */ jsx("div", { className: "bg-white/5 backdrop-blur-sm rounded-3xl p-4 border border-white/10 flex flex-row gap-3 items-center justify-center flex-wrap shadow-inner shadow-black/20", children: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => toggleScratch(digit),
          className: `w-10 h-10 md:w-12 md:h-12 rounded-full font-mono font-bold text-lg md:text-xl transition-all duration-300 border relative overflow-hidden group hover:shadow-lg hover:shadow-purple-500/20 active:scale-90 ${scratchpad[digit] ? "bg-red-500/10 text-white/20 border-red-500/20 scale-95 grayscale" : "bg-gradient-to-br from-white/10 to-white/5 text-white border-white/10 hover:border-purple-400/50 hover:scale-110 hover:-translate-y-1"}`,
          children: [
            digit,
            /* @__PURE__ */ jsxs("div", { className: `absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${scratchpad[digit] ? "opacity-100" : "opacity-0"}`, children: [
              /* @__PURE__ */ jsx("div", { className: "w-[120%] h-1 bg-red-500/60 rotate-45 transform origin-center shadow-sm" }),
              /* @__PURE__ */ jsx("div", { className: "absolute w-[120%] h-1 bg-red-500/60 -rotate-45 transform origin-center shadow-sm" })
            ] })
          ]
        },
        digit
      )) })
    ] }),
    (gameState === "won" || gameState === "lost") && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/80 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white/10 backdrop-blur-md rounded-3xl p-12 shadow-2xl border border-white/20 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-6xl mb-4", children: gameState === "won" ? "🏆" : "😔" }),
      /* @__PURE__ */ jsx("h2", { className: "text-4xl font-bold mb-4", children: gameState === "won" ? "¡Ganaste!" : "Perdiste" }),
      /* @__PURE__ */ jsxs("p", { className: "text-white/60 mb-6", children: [
        "El número era: ",
        /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold text-white tracking-widest ml-2", children: opponentSecret || "..." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => window.location.reload(),
            className: "px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full transition-all shadow-lg shadow-purple-500/30",
            children: "Jugar de Nuevo"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onExit,
            className: "px-8 py-2 text-white/60 hover:text-white transition-colors text-sm font-bold",
            children: "Salir al Menú Principal"
          }
        )
      ] })
    ] }) }),
    showHelp && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white/10 border border-white/20 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowHelp(false),
          className: "absolute top-4 right-4 text-white/40 hover:text-white text-2xl font-bold p-2",
          children: "×"
        }
      ),
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black mb-6 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent", children: "¿Cómo jugar?" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6 text-white/80", children: [
        /* @__PURE__ */ jsx("section", { children: /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-sm", children: "Adivina el número secreto de 4 dígitos únicos de tu oponente antes que él adivine el tuyo." }) }),
        /* @__PURE__ */ jsxs("section", { className: "grid grid-cols-1 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-black/20 p-4 rounded-2xl border border-white/5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🐂" }),
              /* @__PURE__ */ jsx("h4", { className: "font-bold text-green-400 uppercase tracking-wider text-xs", children: "Toros" })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs", children: [
              "Número correcto en la posición ",
              /* @__PURE__ */ jsx("strong", { children: "correcta" }),
              "."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-black/20 p-4 rounded-2xl border border-white/5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🐄" }),
              /* @__PURE__ */ jsx("h4", { className: "font-bold text-yellow-400 uppercase tracking-wider text-xs", children: "Vacas" })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs", children: [
              "Número correcto en la posición ",
              /* @__PURE__ */ jsx("strong", { children: "incorrecta" }),
              "."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-500/10 p-4 rounded-2xl border border-blue-400/20 text-xs italic", children: [
          "Ejemplo: Secreto 1234, Adivinas 1478: ",
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("strong", { children: "1 Toro" }),
          " (el 1) y ",
          /* @__PURE__ */ jsx("strong", { children: "1 Vaca" }),
          " (el 4)."
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowHelp(false),
          className: "w-full mt-8 py-3 bg-white text-black font-bold rounded-2xl hover:bg-blue-50 transition-colors shadow-lg",
          children: "¡Entendido!"
        }
      )
    ] }) })
  ] });
}

function App() {
  const [gameMode, setGameMode] = useState(null);
  const [vsState, setVSState] = useState("lobby");
  const [peer, setPeer] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const exitToMainMenu = () => {
    setGameMode(null);
    setVSState("lobby");
    setPeer(null);
    if (connection) {
      connection.close();
      setConnection(null);
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("room");
    window.history.pushState({}, "", url.pathname);
  };
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("room")) {
      setGameMode("vs");
    }
  }, []);
  if (!gameMode) {
    return /* @__PURE__ */ jsx(MainMenu, { onStartGame: (mode) => setGameMode(mode) });
  }
  if (gameMode === "solo") {
    return /* @__PURE__ */ jsx(Game, { onBack: exitToMainMenu });
  }
  if (vsState === "lobby") {
    return /* @__PURE__ */ jsx(
      VSLobby,
      {
        onGameStart: (p, conn, host) => {
          setPeer(p);
          setConnection(conn);
          setIsHost(host);
          setVSState("game");
        },
        onBack: exitToMainMenu
      }
    );
  }
  if (peer && connection) {
    return /* @__PURE__ */ jsx(
      VSGame,
      {
        peer,
        connection,
        isHost,
        onExit: exitToMainMenu
      }
    );
  }
  return null;
}

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`<html lang="es"> <head><meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="viewport" content="width=device-width"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>Vacas y Toros</title>${renderHead()}</head> <body class="bg-slate-900 text-white min-h-screen flex items-center justify-center"> ${renderComponent($$result, "App", App, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/luisr/personalProjects/Vacas y Toros/src/components/App", "client:component-export": "default" })} </body></html>`;
}, "/home/luisr/personalProjects/Vacas y Toros/src/pages/index.astro", void 0);

const $$file = "/home/luisr/personalProjects/Vacas y Toros/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
