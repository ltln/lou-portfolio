"use client";

import { useEffect } from "react";

export function MermaidHydrator() {
  useEffect(() => {
    let active = true;
    let initialized = false;
    let pending = false;
    let renderCount = 0;
    let mermaidModule: Awaited<ReturnType<typeof importMermaid>> | null = null;
    const selector =
      'code[data-language="mermaid"], code.language-mermaid, pre[data-language="mermaid"] code, figure[data-language="mermaid"] code';

    async function renderMermaidBlocks() {
      if (!active || pending) return;
      const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
      if (!nodes.length) return;

      pending = true;
      try {
        mermaidModule ??= await importMermaid();
        const mermaid = mermaidModule.default;
        if (!initialized) {
          initialized = true;
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            theme: "base",
            themeVariables: {
              background: "transparent",
              primaryColor: "rgb(var(--surface-muted))",
              primaryTextColor: "rgb(var(--foreground))",
              primaryBorderColor: "rgb(var(--border))",
              lineColor: "rgb(var(--accent))",
              secondaryColor: "rgb(var(--surface))",
              tertiaryColor: "rgb(var(--background))",
            },
          });
        }

        await Promise.all(
          nodes.map(async (node, index) => {
            const chart = node.textContent?.trim();
            const frame = node.closest("figure") ?? node.closest("pre") ?? node;
            if (!active || !chart || !frame || frame.getAttribute("data-mermaid-rendered")) return;
            frame.setAttribute("data-mermaid-rendered", "pending");
            try {
              const { svg } = await mermaid.render(
                `mermaid-diagram-${renderCount}-${index}`,
                chart,
              );
              const wrapper = document.createElement("div");
              wrapper.className =
                "not-prose relative my-8 overflow-hidden border border-border bg-surface/70";
              wrapper.setAttribute("data-mermaid-rendered", "true");
              const viewport = document.createElement("div");
              viewport.className = "relative min-h-64 overflow-hidden";
              const content = document.createElement("div");
              content.className = "min-w-[42rem] [&_svg]:h-auto [&_svg]:max-w-none";
              content.innerHTML = svg;
              viewport.append(content);
              wrapper.append(createMermaidToolbar(content), viewport);
              frame.replaceWith(wrapper);
            } catch {
              frame.setAttribute("data-mermaid-rendered", "failed");
            }
          }),
        );
        renderCount += 1;
      } catch {
        // Keep the original code block visible if Mermaid cannot load.
      } finally {
        pending = false;
      }
    }

    const observer = new MutationObserver(() => {
      void renderMermaidBlocks();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const retry = window.setTimeout(() => {
      void renderMermaidBlocks();
    }, 500);
    void renderMermaidBlocks();

    return () => {
      active = false;
      observer.disconnect();
      window.clearTimeout(retry);
    };
  }, []);

  return null;
}

function importMermaid() {
  return import("mermaid");
}

function createMermaidToolbar(content: HTMLElement) {
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let panEnabled = false;
  let lastX = 0;
  let lastY = 0;
  let panToggleButton: HTMLButtonElement;
  let frame = 0;

  const toolbar = document.createElement("div");
  toolbar.className =
    "absolute right-3 top-3 z-10 flex border border-border bg-background/92 p-1 shadow-[0_12px_36px_rgb(0_0_0_/_0.18)] backdrop-blur";

  const applyTransform = () => {
    content.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    content.style.transformOrigin = "0 0";
  };

  const scheduleTransform = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      applyTransform();
    });
  };

  const zoom = (delta: number) => {
    scale = Math.min(2.5, Math.max(0.5, scale + delta));
    applyTransform();
  };

  const reset = () => {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    applyTransform();
  };

  const resetPan = () => {
    offsetX = 0;
    offsetY = 0;
    applyTransform();
  };

  const syncPanState = () => {
    content.classList.toggle("cursor-grab", panEnabled);
    content.classList.toggle("cursor-default", !panEnabled);
    panToggleButton.textContent = panEnabled ? "LOCK" : "MOVE";
    panToggleButton.setAttribute(
      "aria-label",
      panEnabled ? "Lock diagram panning" : "Unlock diagram panning",
    );
    panToggleButton.setAttribute("aria-pressed", String(panEnabled));
  };

  content.classList.add(
    "cursor-default",
    "select-none",
    "transition-transform",
    "will-change-transform",
  );
  content.addEventListener("pointerdown", (event) => {
    if (!panEnabled) return;
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    content.classList.remove("transition-transform");
    content.classList.remove("cursor-grab");
    content.classList.add("cursor-grabbing");
    content.setPointerCapture(event.pointerId);
  });
  content.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    event.preventDefault();
    offsetX += event.clientX - lastX;
    offsetY += event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    scheduleTransform();
  });
  content.addEventListener("pointerup", (event) => {
    dragging = false;
    content.classList.add("transition-transform");
    content.classList.add("cursor-grab");
    content.classList.remove("cursor-grabbing");
    content.releasePointerCapture(event.pointerId);
  });
  content.addEventListener("pointercancel", () => {
    dragging = false;
    content.classList.add("transition-transform");
    content.classList.add("cursor-grab");
    content.classList.remove("cursor-grabbing");
  });
  content.addEventListener(
    "wheel",
    (event) => {
      if (!panEnabled) return;
      event.preventDefault();
      zoom(event.deltaY > 0 ? -0.1 : 0.1);
    },
    { passive: false },
  );

  toolbar.append(
    (panToggleButton = createToolbarButton("MOVE", "Unlock diagram panning", () => {
      panEnabled = !panEnabled;
      dragging = false;
      content.classList.remove("cursor-grabbing");
      syncPanState();
    })),
    createToolbarButton("PAN", "Reset diagram pan", resetPan),
    createToolbarButton("-", "Zoom out", () => zoom(-0.15)),
    createToolbarButton("+", "Zoom in", () => zoom(0.15)),
    createToolbarButton("1:1", "Reset diagram view", reset),
  );
  syncPanState();

  return toolbar;
}

function createToolbarButton(label: string, ariaLabel: string, onClick: () => void) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.setAttribute("aria-label", ariaLabel);
  button.className =
    "flex h-8 min-w-8 items-center justify-center px-2 font-mono text-[11px] text-accent hover:bg-surface-muted hover:text-accent/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";
  button.addEventListener("click", onClick);
  return button;
}
