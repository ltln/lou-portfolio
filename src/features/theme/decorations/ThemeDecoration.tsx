"use client";

import dynamic from "next/dynamic";
import { particlesEnabled } from "../theme.config";
import { useThemeMode } from "../theme.provider";
import { getParticleConfig } from "../theme.utils";

const ParticleCanvas = dynamic(() => import("./ParticleCanvas"), {
  ssr: false,
  loading: () => null,
});

export function ThemeDecoration() {
  const { selection } = useThemeMode();
  const config = getParticleConfig(selection, particlesEnabled);
  if (!config.enabled) return null;
  return <ParticleCanvas config={config} />;
}
