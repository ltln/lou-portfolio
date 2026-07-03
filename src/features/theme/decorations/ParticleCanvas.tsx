"use client";

import { useEffect, useMemo, useState } from "react";
import Particles from "@tsparticles/react";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";
import type { ThemeParticleConfig } from "../theme.types";

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
  const snow = preset === "snow";
  const blossoms = preset === "blossoms";
  return {
    fullScreen: { enable: true, zIndex: -1 },
    detectRetina: false,
    fpsLimit: 30,
    interactivity: { events: { onHover: { enable: false }, onClick: { enable: false } } },
    particles: {
      number: { value: snow ? 18 : 14 },
      color: { value: blossoms ? "#df4b3f" : snow ? "#eef7ff" : "#ab609b" },
      opacity: { value: snow ? 0.2 : 0.16 },
      size: { value: { min: 1, max: snow ? 3 : 2 } },
      move: { enable: true, speed: snow ? 0.45 : 0.22, direction: snow ? "bottom" : "none" },
      links: { enable: false },
    },
  };
}

export default function ParticleCanvas({ config }: { config: ThemeParticleConfig }) {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    setAllowed(
      config.enabled &&
        !(config.respectReducedMotion && reduced) &&
        !(config.disableOnMobile && mobile),
    );
  }, [config.disableOnMobile, config.enabled, config.respectReducedMotion]);

  useEffect(() => {
    if (!allowed) return;
    let active = true;
    initParticlesEngine(async (engine) => loadSlim(engine)).then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
      setReady(false);
    };
  }, [allowed]);

  const options = useMemo(
    () => mergeOptions(presetOptions(config.preset), config.options),
    [config.options, config.preset],
  );

  if (!allowed || !ready) return null;
  return <Particles id="theme-decoration" options={options} className="pointer-events-none" />;
}
