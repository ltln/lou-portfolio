"use client";

import { useEffect, useMemo, useState } from "react";
import Particles from "@tsparticles/react";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";
import type { ThemeParticleConfig } from "../theme.types";

type CssPreset = "hearts" | "apricot-blossoms" | "snow";

interface ParticleSpec {
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  spin: number;
  opacity: number;
  char: string;
  color: string;
}

const cssPresetSet = new Set<ThemeParticleConfig["preset"]>(["hearts", "apricot-blossoms", "snow"]);

function mergeOptions(base: ISourceOptions, override?: ISourceOptions): ISourceOptions {
  if (!override) return base;
  const baseFullScreen = typeof base.fullScreen === "object" ? base.fullScreen : {};
  const overrideFullScreen = typeof override.fullScreen === "object" ? override.fullScreen : {};
  return {
    ...base,
    ...override,
    fullScreen: { ...baseFullScreen, ...overrideFullScreen, enable: true, zIndex: -1 },
    interactivity: {
      ...base.interactivity,
      ...override.interactivity,
      events: { ...base.interactivity?.events, ...override.interactivity?.events },
    },
    particles: { ...base.particles, ...override.particles, links: { enable: false } },
  };
}

function presetOptions(preset: ThemeParticleConfig["preset"]): ISourceOptions {
  return {
    fullScreen: { enable: true, zIndex: -1 },
    detectRetina: false,
    fpsLimit: 30,
    interactivity: { events: { onHover: { enable: false }, onClick: { enable: false } } },
    particles: {
      number: { value: 14 },
      color: { value: preset === "fireflies" ? "#f2c870" : "#ab609b" },
      opacity: { value: 0.14 },
      size: { value: { min: 1, max: 2 } },
      move: { enable: true, speed: 0.22, direction: "none" },
      links: { enable: false },
    },
  };
}

function isCssPreset(preset: ThemeParticleConfig["preset"]): preset is CssPreset {
  return cssPresetSet.has(preset);
}

export default function ParticleCanvas({ config }: { config: ThemeParticleConfig }) {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobileQuery = window.matchMedia("(max-width: 760px)");
    setMobile(mobileQuery.matches);
    setAllowed(
      config.enabled &&
        !(config.respectReducedMotion && reduced) &&
        !(config.disableOnMobile && mobileQuery.matches),
    );
  }, [config.disableOnMobile, config.enabled, config.respectReducedMotion]);

  useEffect(() => {
    if (!allowed || isCssPreset(config.preset)) return;
    let active = true;
    initParticlesEngine(async (engine) => loadSlim(engine)).then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
      setReady(false);
    };
  }, [allowed, config.preset]);

  const options = useMemo(
    () => mergeOptions(presetOptions(config.preset), config.options),
    [config.options, config.preset],
  );

  if (!allowed) return null;

  if (isCssPreset(config.preset)) {
    return <CssParticleLayer preset={config.preset} mobile={mobile} />;
  }

  if (!ready) return null;
  return <Particles id="theme-decoration" options={options} className="pointer-events-none" />;
}

function CssParticleLayer({ preset, mobile }: { preset: CssPreset; mobile: boolean }) {
  const specs = useMemo(() => createParticleSpecs(preset, mobile), [preset, mobile]);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-[1] overflow-hidden">
      <style>{cssParticleStyles}</style>
      {specs.map((spec, index) => (
        <span
          key={`${preset}-${index}`}
          className={`theme-particle theme-particle-${preset}`}
          style={
            {
              "--particle-left": `${spec.left}%`,
              "--particle-delay": `${spec.delay}s`,
              "--particle-duration": `${spec.duration}s`,
              "--particle-size": `${spec.size}px`,
              "--particle-drift": `${spec.drift}px`,
              "--particle-spin": `${spec.spin}deg`,
              "--particle-opacity": spec.opacity,
              color: spec.color,
            } as React.CSSProperties
          }
        >
          {spec.char}
        </span>
      ))}
    </div>
  );
}

function createParticleSpecs(preset: CssPreset, mobile: boolean): ParticleSpec[] {
  const count = mobile ? particleCount(preset).mobile : particleCount(preset).desktop;
  return Array.from({ length: count }, (_, index) => {
    const seed = index + (preset === "hearts" ? 11 : preset === "apricot-blossoms" ? 29 : 47);
    const left = pseudo(seed, 13, 94);
    const duration = particleDuration(preset, seed);
    const delay = -pseudo(seed + 7, 0, duration);
    return {
      left,
      delay,
      duration,
      size: pseudo(seed + 5, preset === "snow" ? 8 : 10, preset === "snow" ? 18 : 22),
      drift: pseudo(seed + 9, preset === "snow" ? -32 : -54, preset === "snow" ? 32 : 54),
      spin: pseudo(seed + 15, -420, 420),
      opacity: pseudo(seed + 4, preset === "snow" ? 18 : 16, preset === "snow" ? 46 : 34) / 100,
      char: particleChar(preset, seed),
      color: particleColor(preset, seed),
    };
  });
}

function particleDuration(preset: CssPreset, seed: number) {
  if (preset === "snow") return pseudo(seed + 3, 28, 52);
  if (preset === "apricot-blossoms") return pseudo(seed + 3, 18, 34);
  return pseudo(seed + 3, 16, 30);
}

function particleCount(preset: CssPreset) {
  if (preset === "snow") return { desktop: 42, mobile: 22 };
  if (preset === "apricot-blossoms") return { desktop: 24, mobile: 12 };
  return { desktop: 20, mobile: 10 };
}

function particleChar(preset: CssPreset, seed: number) {
  if (preset === "hearts") return seed % 3 === 0 ? "\u2661" : "\u2665";
  if (preset === "apricot-blossoms") return seed % 2 === 0 ? "\u273f" : "\u2740";
  return seed % 3 === 0 ? "\u2744" : "\u2745";
}

function particleColor(preset: CssPreset, seed: number) {
  if (preset === "hearts") return seed % 2 === 0 ? "rgb(171 96 155)" : "rgb(198 160 255)";
  if (preset === "apricot-blossoms")
    return seed % 3 === 0 ? "rgb(242 200 112)" : "rgb(255 214 176)";
  return seed % 3 === 0 ? "rgb(143 211 255)" : "rgb(238 247 255)";
}

function pseudo(seed: number, min: number, max: number) {
  const value = Math.sin(seed * 999) * 10000;
  return Math.round(min + (value - Math.floor(value)) * (max - min));
}

const cssParticleStyles = `
  .theme-particle {
    position: absolute;
    left: var(--particle-left);
    bottom: -12vh;
    display: inline-block;
    font-size: var(--particle-size);
    line-height: 1;
    opacity: var(--particle-opacity);
    transform: translate3d(0,0,0);
    animation-duration: var(--particle-duration);
    animation-delay: var(--particle-delay);
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    will-change: transform, opacity;
  }
  .theme-particle-hearts {
    animation-name: theme-heart-float;
    filter: drop-shadow(0 0 8px rgb(255 143 199 / 0.18));
  }
  .theme-particle-apricot-blossoms {
    animation-name: theme-blossom-float;
    filter: drop-shadow(0 0 7px rgb(242 200 112 / 0.16));
  }
  .theme-particle-snow {
    top: -10vh;
    bottom: auto;
    animation-name: theme-snow-fall;
  }
  @keyframes theme-heart-float {
    0% { opacity: 0; transform: translate3d(0, 0, 0) rotate(0deg) scale(0.82); }
    12% { opacity: var(--particle-opacity); }
    34% { transform: translate3d(calc(var(--particle-drift) * -0.25), -34vh, 0) rotate(calc(var(--particle-spin) * 0.32)) scale(1.12); }
    58% { transform: translate3d(calc(var(--particle-drift) * 0.42), -62vh, 0) rotate(calc(var(--particle-spin) * 0.68)) scale(0.92); }
    78% { opacity: var(--particle-opacity); }
    100% { opacity: 0; transform: translate3d(var(--particle-drift), -112vh, 0) rotate(var(--particle-spin)) scale(1.04); }
  }
  @keyframes theme-blossom-float {
    0% { opacity: 0; transform: translate3d(0, 0, 0) rotate(0deg) scale(0.82); }
    14% { opacity: var(--particle-opacity); }
    38% { transform: translate3d(calc(var(--particle-drift) * 0.34), -38vh, 0) rotate(calc(var(--particle-spin) * -0.42)) scale(1.05); }
    64% { transform: translate3d(calc(var(--particle-drift) * -0.28), -70vh, 0) rotate(calc(var(--particle-spin) * 0.74)) scale(0.9); }
    82% { opacity: var(--particle-opacity); }
    100% { opacity: 0; transform: translate3d(var(--particle-drift), -114vh, 0) rotate(var(--particle-spin)) scale(0.78); }
  }
  @keyframes theme-snow-fall {
    0% { opacity: 0; transform: translate3d(0, 0, 0) rotate(0deg); }
    10% { opacity: var(--particle-opacity); }
    36% { transform: translate3d(calc(var(--particle-drift) * -0.22), 40vh, 0) rotate(calc(var(--particle-spin) * 0.36)); }
    68% { transform: translate3d(calc(var(--particle-drift) * 0.44), 76vh, 0) rotate(calc(var(--particle-spin) * 0.68)); }
    90% { opacity: var(--particle-opacity); }
    100% { opacity: 0; transform: translate3d(var(--particle-drift), 114vh, 0) rotate(var(--particle-spin)); }
  }
  @media (prefers-reduced-motion: reduce) {
    .theme-particle { animation: none; opacity: 0; }
  }
`;
