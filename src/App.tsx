// src/App.tsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Mail } from "lucide-react";
import "./deck.css";

/* ===========================
   Types
=========================== */
type Cta = { label: string; href?: string; onClick?: () => void; primary?: boolean };
type Slide = {
  tag?: string;
  title?: string;
  bullets?: string[];
  visual?: React.ReactNode;
  footnote?: string;
  className?: string;
  ctas?: Cta[];
};

/* ===========================
   Helpers (cache-bust + BASE_URL-safe)
=========================== */
// bump whenever media changes
const v = "?v=28";
// works on / (dev) and /<repo>/ (GH Pages)
const base = (import.meta.env?.BASE_URL ?? "/").replace(/\/+$/, "");
const asset = (p: string) => `${base}/${String(p).replace(/^\/+/, "")}${v}`;

/* ===========================
   Widgets
=========================== */
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
          style={{ width: "100%", height: 360, objectFit: "cover" }}
        >
          <source src={asset("vayumetrics_scan_white.mp4")} type="video/mp4" />
        </video>
      ) : (
        <img className="visual-img" src={asset("3D_digital_twin.png")} alt="Vayumetrics intro" />
      )}
    </div>
  );
};

/** ROI — full-stage */
function ROI() {
  const [N, setN] = useState(40000);
  const [C, setC] = useState(6);
  const [Lm, setLm] = useState(250);
  const [Ld, setLd] = useState(3000);
  const [sup, setSup] = useState(0.25);
  const [rate, setRate] = useState(25);
  const [fee, setFee] = useState(24000);

  const Hm = (N * C) / Math.max(Lm, 1);
  const Hd = ((N * C) / Math.max(Ld, 1)) * Math.max(sup, 0);
  const labor = Math.max(0, (Hm - Hd) * Math.max(rate, 0));
  const payback = labor > 0 ? (12 * Math.max(fee, 0)) / labor : Infinity;

  return (
    <div className="roi" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div
        className="roi-wrap"
        style={{ display: "grid", gridTemplateColumns: "minmax(260px,1fr) 2fr", gap: 16 }}
      >
        <aside
          style={{
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: 12,
            background: "#fff",
          }}
        >
          <h3 style={{ margin: "4px 0 10px" }}>ROI calculator</h3>
          <ul style={{ margin: "0 0 10px 18px", color: "var(--muted)" }}>
            <li><b>Locations</b>: total storage positions.</li>
            <li><b>Cycles / year</b>: complete counts/year.</li>
            <li><b>Manual</b> & <b>Drone</b> rate: locations per hour.</li>
            <li><b>Supervision</b>: fraction of a person during scans.</li>
            <li><b>Labor $/hr</b> and yearly <b>fee</b>.</li>
          </ul>
          <div
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              fontSize: 12.5,
              background: "#fbfdff",
              border: "1px dashed var(--line)",
              borderRadius: 8,
              padding: "10px 12px",
              color: "var(--ink)",
            }}
          >
            Manual h = (Loc × Cycles) / Manual rate<br />
            Drone h = (Loc × Cycles) / Drone rate × Supervision<br />
            Labor $ = (Manual − Drone) × $/hr<br />
            Payback (mo) = 12 × Fee ÷ Labor $
          </div>
        </aside>

        <section>
          <div className="roi-grid">
            <label>Locations<input type="number" value={N} min={0} onChange={e=>setN(+e.target.value||0)} /></label>
            <label>Cycles / year<input type="number" value={C} min={0} onChange={e=>setC(+e.target.value||0)} /></label>
            <label>Manual rate (loc/hr)<input type="number" value={Lm} min={1} onChange={e=>setLm(+e.target.value||1)} /></label>
            <label>Drone rate (loc/hr)<input type="number" value={Ld} min={1} onChange={e=>setLd(+e.target.value||1)} /></label>
            <label>Supervision factor<input step="0.05" type="number" value={sup} min={0} max={1} onChange={e=>setSup(+e.target.value||0)} /></label>
            <label>Labor $/hr<input type="number" value={rate} min={0} onChange={e=>setRate(+e.target.value||0)} /></label>
            <label>Annual fee ($)<input type="number" value={fee} min={0} onChange={e=>setFee(+e.target.value||0)} /></label>
          </div>
          <div className="roi-out">
            <div><b>Manual hours</b> ≈ {Hm.toFixed(0)} h / yr</div>
            <div><b>Drone hours</b> ≈ {Hd.toFixed(0)} h / yr</div>
            <div><b>Labor savings</b> ≈ ${labor.toLocaleString(undefined,{maximumFractionDigits:0})} / yr</div>
            <div><b>Payback</b> ≈ {isFinite(payback) ? payback.toFixed(1) : "–"} months</div>
          </div>
        </section>
      </div>
    </div>
  );
}

/** Competitor map */
const CompetitorMap: React.FC = () => {
  const pts = [
    { x: 0.15, y: 0.15, r: 16, label: "Manual scanning", color: "#9aa7bd" },
    { x: 0.48, y: 0.62, r: 26, label: "Vayumetrics (software-first)", color: "#2b7cff", hero: true },
    { x: 0.68, y: 0.42, r: 16, label: "Corvus (drones)", color: "#6da8ff" },
    { x: 0.62, y: 0.40, r: 16, label: "Gather AI (drones)", color: "#6da8ff" },
    { x: 0.64, y: 0.30, r: 16, label: "Dexory (AMR)", color: "#6da8ff" },
    { x: 0.66, y: 0.26, r: 16, label: "Vimaan (fixed cams)", color: "#6da8ff" },
    { x: 0.82, y: 0.50, r: 18, label: "Verity (drones)", color: "#6da8ff" },
  ];
  const W = 900, H = 520, pad = 56;
  const fw = W - pad * 2, fh = H - pad * 2;
  const X = (t: number) => pad + t * fw;
  const Y = (t: number) => pad + (1 - t) * fh;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" aria-label="Competitor landscape">
      <rect x="0" y="0" width={W} height={H} rx="22" fill="#fff" stroke="#e7effa" />
      <rect x={pad} y={pad} width={fw} height={fh} rx="18" fill="#f8fbff" stroke="#e7effa" />
      <g stroke="#eaf2ff">
        {[0.25, 0.5, 0.75].map((t, i) => <line key={`v${i}`} x1={X(t)} y1={pad} x2={X(t)} y2={pad + fh} />)}
        {[0.25, 0.5, 0.75].map((t, i) => <line key={`h${i}`} x1={pad} y1={Y(t)} x2={pad + fw} y2={Y(t)} />)}
      </g>
      <g style={{ fill: "#243b6b", fontWeight: 900 }}>
        <text x={pad + fw / 2} y={H - 18} textAnchor="middle" fontSize="16">HARDWARE COST — LOW → HIGH</text>
        <text x="20" y={pad + fh / 2} transform={`rotate(-90 20 ${pad + fh / 2})`} textAnchor="middle" fontSize="16">
          AUTOMATION — LOW → HIGH
        </text>
      </g>
      {pts.map((p, i) => (
        <g key={i} transform={`translate(${X(p.x)}, ${Y(p.y)})`}>
          <circle r={p.r} fill={p.color} stroke={p.hero ? "#1a5fe0" : "none"} strokeWidth={p.hero ? 2 : 0} />
          <text x={p.r + 10} y="5" style={{ fill: "#1b2e58", fontSize: 14, fontWeight: p.hero ? 900 : 700 }}>
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

/** Market sizing — improved presentation (TAM/SAM/SOM) */
const MarketSizing: React.FC = () => {
  const W = 980, H = 520;
  const cx = W * 0.35, cy = H * 0.55;
  const rT = 180, rS = 120, rO = 70;

  const Callout = ({
    y, title, value, note, accent = "#3b82f6",
  }: { y:number; title:string; value:string; note:string; accent?:string }) => (
    <g>
      <rect x={W*0.55} y={y-38} width={W*0.38} height={96} rx={14} fill="#fff" stroke="#e6eefb" />
      <circle cx={W*0.55} cy={y+10} r={6} fill={accent} />
      <text x={W*0.74} y={y-12} textAnchor="middle" style={{fill:"#0f1a37",fontWeight:800,fontSize:16}}>
        {title}
      </text>
      <text x={W*0.74} y={y+12} textAnchor="middle" style={{fill:accent,fontWeight:900,fontSize:20}}>
        {value}
      </text>
      <text x={W*0.74} y={y+34} textAnchor="middle" style={{fill:"#5a6f96",fontSize:12}}>
        {note}
      </text>
    </g>
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" aria-label="Market sizing TAM/SAM/SOM">
      <defs>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0b2a6b" floodOpacity="0.08" />
        </filter>
      </defs>
      <rect x="0" y="0" width={W} height={H} rx="22" fill="#fff" stroke="#e7effa" />
      {/* Left rings */}
      <g filter="url(#softShadow)">
        <circle cx={cx} cy={cy} r={rT} fill="#f1f6ff" stroke="#dfe7ff" />
        <circle cx={cx} cy={cy} r={rS} fill="#e6efff" stroke="#d3e2ff" />
        <circle cx={cx} cy={cy} r={rO} fill="#d9e8ff" stroke="#c8ddff" />
      </g>
      <text x={cx} y={cy - rT - 14} textAnchor="middle" style={{fill:"#243b6b",fontWeight:900,fontSize:16}}>
        Market Opportunity
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" style={{fill:"#0f1a37",fontWeight:900,fontSize:14}}>SOM</text>
      <text x={cx} y={cy - rS + 20} textAnchor="middle" style={{fill:"#0f1a37",fontWeight:900,fontSize:14}}>SAM</text>
      <text x={cx} y={cy - rT + 24} textAnchor="middle" style={{fill:"#0f1a37",fontWeight:900,fontSize:14}}>TAM</text>

      {/* Connector guides */}
      <g stroke="#e6eefb">
        <line x1={cx + rO} y1={cy} x2={W*0.55} y2={H*0.35} />
        <line x1={cx + rS} y1={cy - 10} x2={W*0.55} y2={H*0.52} />
        <line x1={cx + rT} y1={cy - 20} x2={W*0.55} y2={H*0.69} />
      </g>

      {/* Right callouts (top to bottom) */}
      <Callout y={H*0.35} title="TAM (macro)" value="≈ $55–60B (2030)" note="Warehouse automation analysts" accent="#1d4ed8" />
      <Callout y={H*0.52} title="SAM (top-down)" value="≈ $2–4B (NA+EU)" note="Inventory intel & twin software wedge" accent="#2563eb" />
      <Callout y={H*0.69} title="SAM (bottom-up)" value="≈ $0.4–0.84B" note="8–12k sites × $50–70k ACV" accent="#3b82f6" />
      <Callout y={H*0.86} title="SOM (3–4 yrs)" value="≈ $12M ARR" note="~200 sites × ~$60k ACV" accent="#60a5fa" />
    </svg>
  );
};

/* ===========================
   Slides
=========================== */
function makeSlides(next: (index: number) => void): Slide[] {
  return [
    // 0 — COVER (video)
    {
      tag: "VAYUMETRICS",
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

    // 3 — PRODUCT
    {
      tag: "PRODUCT",
      title: "Searchable, spatial 3D digital twin",
      bullets: [
        "Every scan updates location truth and shelf state.",
        "Search by SKU, pallet, or bay; jump to photo evidence.",
        "Cross-site rollups with freshness indicators.",
      ],
      visual: <img className="visual-img" src={asset("3Dt.png")} alt="3D twin" />,
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
      visual: <img className="visual-img" src={asset("How_solution_works.png")} alt="How it works" />,
    },

    // 5 — BENEFITS (image only → fills card)
    {
      tag: "BENEFITS",
      title: "Measurable impact from week one",
      visual: <img className="visual-img" src={asset("B1.png")} alt="Key benefits" />,
      // If you want copy instead later, uncomment and it will switch to 2-col:
      // bullets: [
      //   "Higher accuracy — greater precision than manual counts.",
      //   "Fast turnaround — reduce time and cost of cycle counting.",
      //   "Autonomous operation — free up teams for value work.",
      //   "API integration — connect ERP/WMS to automate.",
      // ],
    },

    // 6 — SECURITY (image only → fills card)
    {
      tag: "BENEFITS",
      title: "Security • Privacy • Guardrails",
      visual: <img className="visual-img" src={asset("S1.png")} alt="Security & privacy" />,
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

    // 8 — MARKET (improved TAM / SAM / SOM)
    {
      tag: "MARKET",
      title: "TAM · SAM · SOM (top-down + bottom-up)",
      bullets: [
        "TAM ≈ $55–60B by 2030.",
        "SAM (NA+EU software wedge) ≈ $2–4B; bottom-up cross-check ≈ $0.4–0.84B.",
        "SOM (3–4 yrs) ≈ $12M ARR (~200 sites × ~$60k).",
      ],
      visual: <MarketSizing />,
    },

    // 9 — COMPETITION
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

    // 10 — PRICING (FULL-SLIDE: two cards; banner embedded; **no bullets**)
    {
      tag: "PRICING",
      title: "Two SKUs & usage that tracks value",
      className: "pricing",
      visual: (
        <div className="price-grid">
          <div className="price-banner">90-day paid pilot with opt-to-buy credit to Year-1.</div>

          <article className="price-card vision" aria-label="Vision plan">
            <span className="badge">VISION</span>
            <h3>Camera-first coverage</h3>
            <div className="price">$18k–$24k / site / yr</div>
            <ul className="features">
              <li>Night scans; zero disruption</li>
              <li>WMS reconciliation &amp; reports</li>
              <li>Usage-based — capped</li>
            </ul>
            <div className="card-foot"><span className="hint">Best for single-site or pilots</span></div>
          </article>

          <article className="price-card pro" aria-label="Pro (LiDAR) plan">
            <span className="badge">PRO (LiDAR)</span>
            <h3>Highest accuracy &amp; coverage</h3>
            <div className="price">$36k+ / site / yr</div>
            <ul className="features">
              <li>Spatial 3D twin + shelf state</li>
              <li>Advanced exception workflows</li>
              <li>Usage-based — capped</li>
            </ul>
            <div className="card-foot"><span className="hint">Multi-aisle / multi-site scale</span></div>
          </article>
        </div>
      ),
    },

    // 11 — ROI (full stage)
    {
      tag: "ROI",
      title: "Back-of-the-envelope ROI",
      visual: <ROI />,
    },

    // 12 — TEAM
    {
      tag: "TEAM",
      title: "Neel Desai — Founder & CEO",
      bullets: [
        "Founder, Vayumetrics • Logistics Engineer, Volvo Mack Trucks",
        "M.Eng. Eng. Mgmt; B.S. Mechanical — Lean Six Sigma GB",
        "Process optimization & product design; SolidWorks/AutoCAD/CNC",
        'LinkedIn: <a href="https://www.linkedin.com/in/neel-arvind-desai/" target="_blank">linkedin.com/in/neel-arvind-desai</a>',
        'Email: <a href="mailto:neel8636@gmail.com">neel8636@gmail.com</a> • Phone: +1 (781) 824-1614',
      ],
      visual: <img className="founder" src={asset("Neel_ph.jpg")} alt="Neel Desai" />,
    },
  ];
}

/* ===========================
   Shell
=========================== */
export default function App() {
  const [i, setI] = useState(0);
  const slides = makeSlides(setI);
  const total = slides.length;
  const s = slides[i];

  // Keyboard + URL hash
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setI((x) => Math.min(total - 1, x + 1));
      if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
    };
    const onHash = () => {
      const n = Number(location.hash.replace(/^#/, ""));
      if (!Number.isNaN(n)) setI(Math.min(total - 1, Math.max(0, n)));
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("hashchange", onHash);
    };
  }, [total]);

  useEffect(() => {
    if (location.hash !== `#${i}`) history.replaceState(null, "", `#${i}`);
  }, [i]);

  const hasText =
    Boolean(s.bullets && s.bullets.length) ||
    Boolean(s.ctas && s.ctas.length) ||
    Boolean(s.footnote);

  return (
    <div className="deck">
      <header className="topbar">
        <div className="brand" onClick={() => setI(0)} title="Back to cover">
          <img src={asset("VL.png")} alt="VL" style={{ height: "80px", objectFit: "contain" }} />
        </div>
        <nav className="menu">
          {/* GH Pages–safe website link */}
          <a href={`${base}/site/`}>Website</a>
          <a href="mailto:neel8636@gmail.com"><Mail size={16} /> Contact</a>
        </nav>
      </header>

      <main className="stage">
        <div className="meta">
          <div className="eyebrow">{s.tag ?? "CONFIDENTIAL • 2025"}</div>
          <div className="counter">{i + 1} / {total}</div>
        </div>

        <article className={`card ${s.className ?? ""}`}>
          {s.title && <h1 className="title">{s.title}</h1>}

          {/* Full-bleed whenever there is no text content */}
          <div className={`grid ${s.visual && hasText ? "has-visual" : "full-bleed"}`}>
            {hasText && (
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
            )}

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
