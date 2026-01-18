const stats = [
  { label: "Latency Target", value: "<16 ms" },
  { label: "Power Goal", value: "↓ 40% GPU draw" },
  { label: "Stage", value: "Simulation Proven" },
];

const pipeline = [
  "Surgical Camera",
  "Frame Grabber",
  "4f Optical Stage",
  "CNN",
  "Segmentation Overlay",
];

const highlights = [
  {
    title: "Hardware-neutral",
    detail: "Optics augment existing CNNs without retraining, keeping regulatory paperwork intact.",
  },
  {
    title: "Simulation-first",
    detail: "TorchOptics modeling lets us chase catastrophic risks (blur, aberrations) before touching hardware.",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden" id="hero">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-transparent opacity-90 pointer-events-none" aria-hidden></div>
      <div className="max-w-6xl mx-auto px-4 py-24 lg:py-32 grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <div className="space-y-8">
          <p className="font-mono text-xs uppercase tracking-[0.5em] text-foreground/70">Team 7 presents</p>
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] text-foreground">
            Light-speed convolution for real-time surgery.
            <span className="block text-lab-accent">No GPU heat sinks required.</span>
          </h1>
          <p className="font-mono text-sm md:text-base text-foreground/85 leading-relaxed max-w-2xl">
            We asked a single question: can a passive optical layer shoulder the heaviest convolution work while surgeons keep the same CNN they already trust? This site is the artifact of that feasibility study—technical, sober, recruiter-ready.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.6)] backdrop-blur">
                <p className="font-mono text-[11px] text-foreground/60 uppercase tracking-[0.3em] mb-2">{item.label}</p>
                <p className="font-serif text-3xl text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-[32px] border border-lab-gray bg-white shadow-[0_20px_80px_rgba(0,0,0,0.08)] p-8">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-foreground/40 mb-6">Imaging Pipeline</p>
            <div className="flex flex-col gap-6">
              {pipeline.map((stage, index) => (
                <div key={stage} className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-lab-accent" aria-hidden></span>
                    <span className="font-serif text-lg text-foreground">{stage}</span>
                  </div>
                  {index < pipeline.length - 1 && (
                    <span className="flex-1 h-px bg-lab-gray" aria-hidden></span>
                  )}
                </div>
              ))}
            </div>
            <p className="font-mono text-xs text-foreground/60 mt-6">
              The 4f stage performs convolution in free space, then hands the features back to the existing CNN for classification and overlay.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-lab-gray/80 bg-white/70 p-5">
                <p className="font-serif text-2xl text-foreground mb-2">{item.title}</p>
                <p className="font-mono text-sm text-foreground/70 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
