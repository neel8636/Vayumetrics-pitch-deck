// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Mail } from "lucide-react";
import "./deck.css";

/* ==========================================================
   Types
========================================================== */
type Slide = {
  tag?: string;
  title?: string;
  bullets?: string[];
  visual?: React.ReactNode;
  footnote?: string;
  ctas?: { label: string; href?: string; onClick?: () => void; primary?: boolean }[];
};

/* ==========================================================
   Asset helper — works locally and on GitHub Pages
   (make sure vite.config.ts has base: '/Vayumetrics-pitch-deck/')
========================================================== */
const v = "?v=17";
const asset = (file: string) => `${import.meta.env.BASE_URL || "/"}${file}${v}`;

/* ==========================================================
   Video cover (fallbacks to poster)
========================================================== */
const VideoHero: React.FC = () => {
  const [fallback, setFallback] = useState(false);
  return (
    <div className="video-hero">
      {!fallback ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={asset("3D_digital_twin.png")}
          onError={() => setFallback(true)}
          style={{ width: "100%", height: 380, objectFit: "cover", borderRadius: 12 }}
        >
          <source src={asset("vayumetrics_scan_white.mp4")} type="video/mp4" />
        </video>
      ) : (
        <img
          className="visual-img"
          src={asset("3D_digital_twin.png")}
          alt="Vayumetrics intro"
          style={{ width: "100%", height: 380, objectFit: "cover", borderRadius: 12 }}
        />
      )}
    </div>
  );
};

/* ==========================================================
   ROI — full-width layout
========================================================== */
function ROI() {
  const [N, setN] = useState(40000); // locations (bins/bays/slots)
  const [C, setC] = useState(6);     // count cycles per year
  const [Lm, setLm] = useState(250); // manual rate (loc/hr)
  const [Ld, setLd] = useState(3000);// drone rate (loc/hr)
  const [sup, setSup] = useState(0.25); // supervision factor (0–1)
  const [rate, setRate] = useState(25); // labor $/hr
  const [fee, setFee] = useState(24000);// annual fee $

  const Hm = (N * C) / Math.max(Lm, 1);
  const Hd = ((N * C) / Math.max(Ld, 1)) * Math.max(sup, 0);
  const labor = Math.max(0, (Hm - Hd) * Math.max(rate, 0));
  const paybackMonths = labor > 0 ? (12 * Math.max(fee, 0)) / labor : Infinity;

  return (
    <div style={{ width: "100%" }}>
      <h3 style={{ marginBottom: 12 }}>ROI calculator</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: 20,
          width: "100%",
        }}
      >
        {/* Inputs */}
        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: 16,
            background: "#fff",
          }}
        >
          <div
            className="roi-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            <label>
              Locations
              <input type="number" value={N} min={0} onChange={(e) => setN(+e.target.value || 0)} />
            </label>
            <label>
              Cycles / year
              <input type="number" value={C} min={0} onChange={(e) => setC(+e.target.value || 0)} />
            </label>
            <label>
              Manual rate (loc/hr)
              <input type="number" value={Lm} min={1} onChange={(e) => setLm(+e.target.value || 1)} />
            </label>
            <label>
              Drone rate (loc/hr)
              <input type="number" value={Ld} min={1} onChange={(e) => setLd(+e.target.value || 1)} />
            </label>
            <label>
              Supervision factor
              <input type="number" step="0.05" value={sup} min={0} max={1} onChange={(e) => setSup(+e.target.value || 0)} />
            </label>
            <label>
              Labor $/hr
              <input type="number" value={rate} min={0} onChange={(e) => setRate(+e.target.value || 0)} />
            </label>
            <label>
              Annual fee ($)
              <input type="number" value={fee} min={0} onChange={(e) => setFee(+e.target.value || 0)} />
            </label>
          </div>
        </div>

        {/* Outputs */}
        <div
          className="roi-out"
          style={{
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: 16,
            background: "#fbfdff",
            display: "grid",
            alignContent: "start",
            gap: 10,
          }}
        >
          <div><b>Manual hours</b> ≈ {Hm.toFixed(0)} h / yr</div>
          <div><b>Drone hours (supervised)</b> ≈ {Hd.toFixed(0)} h / yr</div>
          <div><b>Labor savings</b> ≈ ${labor.toLocaleString(undefined, { maximumFractionDigits: 0 })} / yr</div>
          <div><b>Payback</b> ≈ {isFinite(paybackMonths) ? paybackMonths.toFixed(1) : "–"} months</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
            Tip: include shrink reduction & avoided expedites for a fuller picture.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   Pricing — exactly two big cards
========================================================== */
const PricingCards: React.FC = () => (
  <div
    className="pricing-cards"
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(260px, 1fr))",
      gap: 20,
      width: "100%",
    }}
  >
    <div
      className="pcard"
      style={{
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: 20,
        background: "#fff",
      }}
    >
      <div className="ptier" style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
        Vision
      </div>
      <div className="pprice" style={{ fontSize: 26, fontWeight: 900, marginBottom: 10 }}>
        $18k–$24k<span className="psub" style={{ fontSize: 14, fontWeight: 600 }}> /site/yr</span>
      </div>
      <ul className="pbullets" style={{ lineHeight: 1.5 }}>
        <li>Camera-first coverage</li>
        <li>Night scans; zero disruption</li>
        <li>WMS reconciliation &amp; reports</li>
        <li>Usage-based — capped</li>
      </ul>
    </div>

    <div
      className="pcard featured"
      style={{
        border: "2px solid #2b7cff",
        borderRadius: 16,
        padding: 20,
        background: "#f4f8ff",
      }}
    >
      <div className="ptier" style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
        Pro (LiDAR)
      </div>
      <div className="pprice" style={{ fontSize: 26, fontWeight: 900, marginBottom: 10 }}>
        $36k+<span className="psub" style={{ fontSize: 14, fontWeight: 600 }}> /site/yr</span>
      </div>
      <ul className="pbullets" style={{ lineHeight: 1.5 }}>
        <li>Highest accuracy &amp; coverage</li>
        <li>Spatial 3D twin + shelf state</li>
        <li>Advanced exception workflows</li>
        <li>Usage-based — capped</li>
      </ul>
    </div>
  </div>
);

/* ==========================================================
   Beautiful competitor map (pure SVG)
========================================================== */
const CompetitorMap: React.FC = () => {
  const pts = [
    { x: 0.15, y: 0.22, r: 16, label: "Manual scanning", color: "#9aa7bd" },
    { x: 0.66, y: 0.34, r: 16, label: "Dexory (AMR)", color: "#6da8ff" },
    { x: 0.72, y: 0.28, r: 16, label: "Vimaan (fixed cams)", color: "#6da8ff" },
    { x: 0.66, y: 0.46, r: 16, label: "Gather AI (drones)", color: "#6da8ff" },
    { x: 0.72, y: 0.5, r: 16, label: "Corvus (drones)", color: "#6da8ff" },
    { x: 0.86, y: 0.62, r: 16, label: "Verity (drones)", color: "#6da8ff" },
    { x: 0.48, y: 0.78, r: 22, label: "Vayumetrics (software-first)", color: "#2b7cff", hero: true },
  ];
  const W = 680, H = 400, pad = 44;
  const fw = W - pad * 2, fh = H - pad * 2;
  const X = (t: number) => pad + t * fw;
  const Y = (t: number) => pad + (1 - t) * fh;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="svg" aria-label="Competitor landscape" style={{ width: "100%" }}>
      <rect x="0" y="0" width={W} height={H} rx="18" fill="#fff" stroke="#e6eefb" />
      <rect x={pad} y={pad} width={fw} height={fh} rx="16" fill="#f7fbff" stroke="#e6eefb" />
      <g stroke="#e9f1ff">
        <line x1={pad} y1={pad + fh / 2} x2={pad + fw} y2={pad + fh / 2} />
        <line x1={pad + fw / 2} y1={pad} x2={pad + fw / 2} y2={pad + fh} />
      </g>
      <g fill="#28406b" fontWeight={800} fontSize="12">
        <text x={pad + fw / 2} y={H - 10} textAnchor="middle" className="axis">
          HARDWARE COST → LOW ··· HIGH
        </text>
        <text x="16" y={pad + fh / 2} transform={`rotate(-90 16 ${pad + fh / 2})`} className="axis">
          AUTOMATION → LOW ··· HIGH
        </text>
      </g>
      {pts.map((p, i) => (
        <g key={i} transform={`translate(${X(p.x)}, ${Y(p.y)})`}>
          <circle r={p.r} fill={p.color} stroke={p.hero ? "#1a5fe0" : "none"} strokeWidth={p.hero ? 2 : 0} />
          <text x={p.r + 10} y="5" style={{ fill: "#1b2e58", fontSize: 13, fontWeight: p.hero ? 900 : 700 }}>
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

/* ==========================================================
   Slides (Benefits = full-bleed image, Pricing = two cards,
   ROI = full width section)
========================================================== */
function makeSlides(next: (index: number) => void): Slide[] {
  return [
    // 0 — COVER
    {
      visual: <VideoHero />,
      bullets: ["Autonomous drone scanning • Real-time inventory • Spatial 3D twin"],
      ctas: [
        { label: "Enter deck →", primary: true, onClick: () => next(1) },
        { label: "Executive summary", href: asset("whitepaper.html") },
      ],
      footnote: "If autoplay is blocked, click the video (muted for mobile).",
    },

    // 1 — PROBLEM
    {
      tag: "PROBLEM",
      title: "Manual inventory is slow & error-prone",
      bullets: [
        "Cycle counts disrupt work and still miss misplacements.",
        "Quarter-end firefighting: expedites, overtime, write-offs.",
        "Leaders lack a live, spatial view across sites.",
      ],
      visual: <img className="visual-img" src={asset("problem.png")} alt="Problem" />,
    },

    // 2 — SOLUTION
    {
      tag: "SOLUTION",
      title: "Automate counts; deliver a living 3D twin",
      bullets: [
        "Night scans (scheduled/on-demand) — zero daytime disruption.",
        "Computer vision reads labels & shelf state; Pro adds LiDAR.",
        "WMS reconciliation + photo-proof exception lists each morning.",
      ],
      visual: <img className="visual-img" src={asset("Solution.png")} alt="Solution" />,
    },

    // 3 — PRODUCT: Twin
    {
      tag: "PRODUCT",
      title: "Searchable, spatial 3D digital twin",
      bullets: [
        "Every scan updates location truth and shelf state.",
        "Search by SKU, pallet, or bay; jump to photo evidence.",
        "Cross-site rollups with freshness indicators.",
      ],
      visual: <img className="visual-img" src={asset("3D_digital_twin.png")} alt="3D Digital Twin" />,
    },

    // 4 — HOW IT WORKS
    {
      tag: "HOW IT WORKS",
      title: "Deploy → Scan → Analyze",
      bullets: [
        "Deploy: envelopes & SOPs; docked drone setup.",
        "Scan: night flights capture labels & shelf state.",
        "Analyze: WMS reconciliation & workflows; twin updates.",
      ],
      visual: <img className="visual-img" src={asset("How_solution_works.png")} alt="How solution works" />,
    },

    // 5 — BENEFITS (FULL-WIDTH IMAGE)
    {
      tag: "BENEFITS",
      title: "Measurable impact from week one",
      bullets: ["≥50% fewer count hours", "Exception-driven mornings", "Improves accuracy and OTIF"],
      // Full-bleed image inside the card area
      visual: (
        <img
          src={asset("B1.png") /* or 'benefits_1.png' if you prefer */}
          alt="Benefits"
          style={{
            width: "100%",
            height: "100%",
            maxHeight: 420,
            objectFit: "cover",
            borderRadius: 12,
          }}
        />
      ),
    },

    // 6 — SECURITY / PRIVACY (also can be full-bleed)
    {
      tag: "BENEFITS",
      title: "Security • Privacy • Guardrails",
      bullets: ["Warehouse-only capture", "Access controls & encryption", "Compliance-first design"],
      visual: (
        <img
          src={asset("B2.png") /* or 'Benefits_2.png' */}
          alt="Security & Privacy"
          style={{
            width: "100%",
            height: "100%",
            maxHeight: 420,
            objectFit: "cover",
            borderRadius: 12,
          }}
        />
      ),
    },

    // 7 — ARCHITECTURE
    {
      tag: "ARCHITECTURE",
      title: "Drone → Edge → Cloud → WMS",
      bullets: [
        "Edge capture + QC; secure upload; scalable inference",
        "Role-based access; SSO; audit logs",
        "Connectors for common WMS/ERP",
      ],
      visual: <img className="visual-img" src={asset("system_architecture.png")} alt="System architecture" />,
    },

    // 8 — COMPETITION
    {
      tag: "COMPETITION",
      title: "Automation vs hardware cost — where we win",
      bullets: [
        "Competitors cluster at higher HW cost for comparable automation.",
        "Vayumetrics is software-first: accuracy + workflows + twin.",
        "Partner-agnostic hardware preserves choice & lowers TCO.",
      ],
      visual: <CompetitorMap />,
    },

    // 9 — PRICING (two big cards)
    {
      tag: "PRICING",
      title: "Two SKUs & usage that tracks value",
      bullets: ["90-day paid pilot with opt-to-buy credit to Year-1."],
      visual: <PricingCards />,
    },

    // 10 — ROI (FULL WIDTH)
    {
      tag: "ROI",
      title: "Back-of-the-envelope ROI",
      visual: (
        <div style={{ width: "100%" }}>
          <ROI />
        </div>
      ),
      bullets: ["Adjust locations, cycles, and rates to match your site."],
    },

    // 11 — TEAM
    {
      tag: "TEAM",
      title: "Neel Desai — Founder & CEO",
      bullets: [
        "Founder, Vayumetrics • Logistics Engineer, Volvo Mack Trucks",
        "M.Eng. Engineering Management; B.S. Mechanical Engineering — Lean Six Sigma GB",
        'LinkedIn: <a href="https://www.linkedin.com/in/neel-arvind-desai/" target="_blank">linkedin.com/in/neel-arvind-desai</a>',
        "Email: neel8636@gmail.com • +1 (781)-824-1614",
      ],
      visual: <img className="founder" src={asset("Neel_ph.jpg")} alt="Neel Desai" />,
    },
  ];
}

/* ==========================================================
   Shell
========================================================== */
export default function App() {
  const [i, setI] = useState(0);
  const slides = useMemo(() => makeSlides(setI), []);
  const total = slides.length;
  const s = slides[i];

  // Keyboard nav
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setI((x) => Math.min(total - 1, x + 1));
      if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
    };
    window.addEventListener("keydown", k as any);
    return () => window.removeEventListener("keydown", k as any);
  }, [total]);

  return (
    <div className="deck">
      <header className="topbar">
        <div className="brand" onClick={() => setI(0)} title="Back to first slide" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={asset("VL.png")} // your logo file in /public
            alt="Vayumetrics Logo"
            style={{ height: 64, objectFit: "contain" }}
          />
        </div>
        <nav className="menu">
          <a href={import.meta.env.BASE_URL}>Website</a>
          <a href="mailto:neel8636@gmail.com">
            <Mail size={16} /> Contact
          </a>
        </nav>
      </header>

      <main className="stage">
        <div className="meta">
          <div className="eyebrow">{s.tag ?? "CONFIDENTIAL • 2025"}</div>
          <div className="counter">
            {i + 1} / {total}
          </div>
        </div>

        <article className="card">
          {s.title && <h1 className="title">{s.title}</h1>}

          {/* When we want visuals full width, the slide itself provides it via inline styles.
              Otherwise we keep the standard grid. */}
          <div className={`grid ${s.visual ? "has-visual" : ""}`}>
            <div className="text">
              {s.bullets && (
                <ul
                  className="bullets"
                  dangerouslySetInnerHTML={{
                    __html: s.bullets.map((b) => `<li>${b}</li>`).join(""),
                  }}
                />
              )}
              {s.ctas && (
                <div className="cta-row">
                  {s.ctas.map((c, idx) =>
                    c.href ? (
                      <a className={`btn ${c.primary ? "primary" : ""}`} key={idx} href={c.href}>
                        {c.label} {c.href?.startsWith("http") && <ExternalLink size={14} />}
                      </a>
                    ) : (
                      <button
                        className={`btn ${c.primary ? "primary" : ""}`}
                        key={idx}
                        onClick={c.onClick || (() => setI(Math.min(total - 1, i + 1)))}
                      >
                        {c.label}
                      </button>
                    )
                  )}
                </div>
              )}
              {s.footnote && <div className="footnote" dangerouslySetInnerHTML={{ __html: s.footnote }} />}
            </div>

            {s.visual && <div className="visual">{s.visual}</div>}
          </div>

          {i > 0 && (
            <button className="nav left" onClick={() => setI(Math.max(0, i - 1))} aria-label="Previous">
              <ArrowLeft />
            </button>
          )}
          {i < total - 1 && (
            <button className="nav right" onClick={() => setI(Math.min(total - 1, i + 1))} aria-label="Next">
              <ArrowRight />
            </button>
          )}
        </article>

        <footer className="legal">© 2025 Vayumetrics. All rights reserved.</footer>
      </main>
    </div>
  );
}
