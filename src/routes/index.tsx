import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import type { ViewName } from "@/components/mouth/MouthScene";
import { ORDER, TYPE_LABEL } from "@/components/mouth/anatomy";

const MouthScene = lazy(() => import("@/components/mouth/MouthScene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cloud-Esther · Periodoncia 3D" },
      { name: "description", content: "Modelo anatómico 3D de la boca para el periodontograma de Cloud-Esther." },
      { property: "og:title", content: "Cloud-Esther · Periodoncia 3D" },
      { property: "og:description", content: "Boca 3D realista con arcadas, encías y selección de piezas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const VIEW_LABELS: [ViewName, string][] = [["front", "Frontal"], ["top", "Superior"], ["bottom", "Inferior"], ["side", "Lateral"]];

function describe(id: number) {
  const quad = Math.floor(id / 10);
  const idx = (id % 10) - 1;
  const arcada = quad <= 2 ? "Arcada superior" : "Arcada inferior";
  const lado = quad === 1 || quad === 4 ? "derecha" : "izquierda";
  return { name: TYPE_LABEL[ORDER[idx]], where: `${arcada} · ${lado}` };
}

function Index() {
  const [view, setView] = useState<ViewName>("front");
  const [nonce, setNonce] = useState(0);
  const [open, setOpen] = useState(true);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const info = selected ? describe(selected) : null;

  const chip = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-secondary-foreground hover:bg-accent"}`;

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Cloud-Esther</p>
          <h1 className="text-xl font-semibold text-foreground">Periodoncia · Modelo 3D</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {VIEW_LABELS.map(([v, l]) => (
            <button key={v} className={chip(view === v)} onClick={() => { setView(v); setNonce((n) => n + 1); }}>{l}</button>
          ))}
        </div>
      </header>

      <section className="relative flex-1">
        <div className="absolute inset-0 bg-stage">
          <ClientOnly fallback={<div className="flex h-full items-center justify-center text-muted-foreground">Cargando modelo…</div>}>
            <Suspense fallback={null}>
              <MouthScene view={view} nonce={nonce} open={open} selected={selected} onSelect={setSelected} showUpper={upper} showLower={lower} />
            </Suspense>
          </ClientOnly>
        </div>

        <div className="absolute left-6 top-6 flex flex-col gap-2">
          <button className={chip(upper)} onClick={() => setUpper((x) => !x || !lower)}>Arcada superior</button>
          <button className={chip(lower)} onClick={() => setLower((x) => !x || !upper)}>Arcada inferior</button>
          <button className={chip(open)} onClick={() => setOpen((x) => !x)}>{open ? "Boca abierta" : "En oclusión"}</button>
        </div>

        <div className="absolute bottom-6 right-6 w-64 rounded-2xl border bg-card/90 p-4 shadow-lg backdrop-blur">
          {info ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Pieza {selected}</p>
              <p className="mt-1 text-lg font-semibold text-card-foreground">{info.name}</p>
              <p className="text-sm text-muted-foreground">{info.where}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Hacé clic en un diente para seleccionarlo. Arrastrá para rotar y usá la rueda para acercar.</p>
          )}
        </div>
      </section>
    </main>
  );
}
