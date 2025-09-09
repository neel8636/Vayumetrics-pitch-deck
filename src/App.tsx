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
   Helpers (cache-bust)
=========================== */
// cache-bust (bump whenever you change media)
const v = "?v=23";

// Safe path join using the repo base path Vite injects
const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
const asset = (p: string) => `${base}/${String(p).replace(/^\/+/, "")}${v}`;

// Research file linker — drop files under /public/research/ using their original names
const research = (filename: string) => `${base}/research/${encodeURIComponent(filename)}${v}`;

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

/** ROI with left-side explanations */
function ROI() {
  const [N, setN] = useState(40000); // locations
  const [C, setC] = useState(6);     // cycles/yr
  const [Lm, setLm] = useState(250); // manual loc/hr
  const [Ld, setLd] = useState(3000);// drone loc/hr
  const [sup, setSup] = useState(0.25); // supervision factor
  const [rate, setRate] = useState(25); // $/hr
  const [fee, setFee] = useState(24000);// $/yr

  const Hm = (N * C) / Math.max(Lm, 1);
  const Hd = ((N * C) / Math.max(Ld, 1)) * Math.max(sup, 0);
  const labor = Math.max(0, (Hm - Hd) * Math.max(rate, 0));
  const paybackMonths = labor > 0 ? (12 * Math.max(fee, 0)) / labor : Infinity;

  return (
    <div className="roi">
      <h3 style={{ marginBottom: 12 }}>ROI calculator</h3>

      <div className="roi-wrap" style={{ display: "grid", gridTemplateColumns: "minmax(260px,1fr) 2fr", gap: 16 }}>
        <aside
          className="roi-legend"
          style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 12, background: "#fff" }}
        >
          <strong style={{ display: "block", marginBottom: 8 }}>What the inputs mean</strong>
          <ul style={{ margin: "0 0 10px 18px", padding: 0, color: "var(--muted)" }}>
            <li><b>Locations</b>: total storage positions (bins/bays/slots).</li>
            <li><b>Cycles / year</b>: number of complete counts per year.</li>
            <li><b>Manual rate</b>: locations per hour a person can count.</li>
            <li><b>Drone rate</b>: locations per hour captured at night.</li>
            <li><b>Supervision</b>: fraction of a person during scans (0.25 ≈ 15 min/hr).</li>
            <li><b>Labor $/hr</b>: fully-loaded hourly labor cost.</li>
            <li><b>Annual fee</b>: yearly subscription + support per site.</li>
          </ul>

          <strong style={{ display: "block", margin: "8px 0 6px" }}>Formulas</strong>
          <div
            style={{
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              fontSize: 12.5,
              background: "#fbfdff",
              border: "1px dashed var(--line)",
              borderRadius: 8,
              padding: "10px 12px",
              color: "var(--ink)",
            }}
          >
            <div>Manual hours = (Locations × Cycles) / Manual rate</div>
            <div>Drone hours = (Locations × Cycles) / Drone rate × Supervision</div>
            <div>Labor savings = (Manual − Drone) × Labor $/hr</div>
            <div>Payback (months) = 12 × Annual fee ÷ Labor savings</div>
          </div>
        </aside>

        <section>
          <div className="roi-grid">
            <label>Locations<input type="number" value={N} min={0} onChange={(e) => setN(+e.target.value || 0)} /></label>
            <label>Cycles / year<input type="number" value={C} min={0} onChange={(e) => setC(+e.target.value || 0)} /></label>
            <label>Manual rate (loc/hr)<input type="number" value={Lm} min={1} onChange={(e) => setLm(+e.target.value || 1)} /></label>
            <label>Drone rate (loc/hr)<input type="number" value={Ld} min={1} onChange={(e) => setLd(+e.target.value || 1)} /></label>
            <label>Supervision factor<input type="number" step="0.05" value={sup} min={0} max={1} onChange={(e) => setSup(+e.target.value || 0)} /></label>
            <label>Labor $/hr<input type="number" value={rate} min={0} onChange={(e) => setRate(+e.target.value || 0)} /></label>
            <label>Annual fee ($)<input type="number" value={fee} min={0} onChange={(e) => setFee(+e.target.value || 0)} /></label>
          </div>

          <div className="roi-out">
            <div><b>Manual hours</b> ≈ {Hm.toFixed(0)} h / yr</div>
            <div><b>Drone hours (supervised)</b> ≈ {Hd.toFixed(0)} h / yr</div>
            <div><b>Labor savings</b> ≈ ${labor.toLocaleString(undefined, { maximumFractionDigits: 0 })} / yr</div>
            <div><b>Payback</b> ≈ {isFinite(paybackMonths) ? paybackMonths.toFixed(1) : "–"} months</div>
          </div>

          <p className="roi-note">Tip: include shrink reduction & avoided expedites for a fuller picture.</p>
        </section>
      </div>
    </div>
  );
}

/** Clear competitor landscape with legible labels & correct axes */
const CompetitorMap: React.FC = () => {
  type Pt = {
    x: number; y: number; r: number; label: string; color: string;
    hero?: boolean; dx?: number; dy?: number; anchor?: "start" | "middle" | "end";
  };

  const pts: Pt[] = [
    { x: 0.15, y: 0.15, r: 16, label: "Manual scanning", color: "#9aa7bd", dx: 16, dy: 6, anchor: "start" },
    { x: 0.48, y: 0.62, r: 26, label: "Vayumetrics (software-first)", color: "#2b7cff", hero: true, dx: 18, dy: -18, anchor: "start" },
    { x: 0.68, y: 0.42, r: 16, label: "Corvus (drones)", color: "#6da8ff", dx: 14, dy: -6, anchor: "start" },
    { x: 0.62, y: 0.40, r: 16, label: "Gather AI (drones)", color: "#6da8ff", dx: 14, dy: 18, anchor: "start" },
    { x: 0.64, y: 0.30, r: 16, label: "Dexory (AMR)", color: "#6da8ff", dx: 14, dy: 22, anchor: "start" },
    { x: 0.66, y: 0.26, r: 16, label: "Vimaan (fixed cams)", color: "#6da8ff", dx: 14, dy: 22, anchor: "start" },
    { x: 0.82, y: 0.50, r: 18, label: "Verity (drones)", color: "#6da8ff", dx: 16, dy: 6, anchor: "start" },
  ];

  const W = 900, H = 520, pad = 56;
  const fw = W - pad * 2, fh = H - pad * 2;
  const X = (t: number) => pad + t * fw;       // left -> right
  const Y = (t: number) => pad + (1 - t) * fh; // bottom -> top

  const Label = ({
    x, y, text, dx = 14, dy = -10, anchor = "start",
  }: { x: number; y: number; text: string; dx?: number; dy?: number; anchor?: "start" | "middle" | "end" }) => {
    const lx = x + dx, ly = y + dy;
    const approxW = Math.min(280, Math.max(110, text.length * 7.2));
    const approxH = 26;
    const padX = 10, padY = 6;
    const bx = anchor === "end" ? lx - approxW - padX : anchor === "middle" ? lx - approxW / 2 - padX : lx - padX;
    const by = ly - approxH + 6;
    return (
      <g>
        <line x1={x} y1={y} x2={lx - (anchor === "end" ? 6 : 0)} y2={ly - 6} stroke="#9db7ff" strokeWidth={1.5} />
        <rect x={bx} y={by} rx={8} ry={8} width={approxW + padX * 2} height={approxH + padY * 2}
              fill="#ffffff" stroke="#e6eefb" />
        <text x={lx} y={ly} textAnchor={anchor} style={{ fill: "#1b2e58", fontWeight: 800, fontSize: 14 }}>
          {text}
        </text>
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" aria-label="Competitor landscape">
      <rect x="0" y="0" width={W} height={H} rx="22" fill="#fff" stroke="#e7effa" />
      <rect x={pad} y={pad} width={fw} height={fh} rx="18" fill="#f8fbff" stroke="#e7effa" />

      {/* Grid */}
      <g stroke="#eaf2ff">
        {[0.25, 0.5, 0.75].map((t, i) => <line key={`v${i}`} x1={X(t)} y1={pad} x2={X(t)} y2={pad + fh} />)}
        {[0.25, 0.5, 0.75].map((t, i) => <line key={`h${i}`} x1={pad} y1={Y(t)} x2={pad + fw} y2={Y(t)} />)}
      </g>

      {/* Axes + end labels */}
      <g style={{ fill: "#243b6b", fontWeight: 900 }}>
        <text x={pad + fw / 2} y={H - 18} textAnchor="middle" fontSize="16">
          HARDWARE COST — LOW → HIGH
        </text>
        <text x={pad} y={H - 36} textAnchor="start" fontSize="12" style={{ fill: "#5a6f96", fontWeight: 800 }}>LOW</text>
        <text x={pad + fw} y={H - 36} textAnchor="end" fontSize="12" style={{ fill: "#5a6f96", fontWeight: 800 }}>HIGH</text>

        <text x="20" y={pad + fh / 2} transform={`rotate(-90 20 ${pad + fh / 2})`} textAnchor="middle" fontSize="16">
          AUTOMATION — LOW → HIGH
        </text>
        <text x={pad - 24} y={pad + fh} textAnchor="end" fontSize="12" style={{ fill: "#5a6f96", fontWeight: 800 }}>LOW</text>
        <text x={pad - 24} y={pad + 10} textAnchor="end" fontSize="12" style={{ fill: "#5a6f96", fontWeight: 800 }}>HIGH</text>
      </g>

      {/* Points + labels */}
      {pts.map((p, i) => {
        const cx = X(p.x), cy = Y(p.y);
        return (
          <g key={i}>
            <circle
              cx={cx} cy={cy} r={p.r}
              fill={p.color}
              stroke={p.hero ? "#1a5fe0" : "rgba(0,0,0,0)"}
              strokeWidth={p.hero ? 2 : 0}
              filter={p.hero ? "drop-shadow(0 4px 10px rgba(34,86,255,0.25))" : undefined}
            />
            <Label x={cx} y={cy} text={p.label} dx={p.dx} dy={p.dy} anchor={p.anchor} />
          </g>
        );
      })}
    </svg>
  );
};

/** Market sizing — top-down + bottom-up with sources */
const MarketSizing: React.FC = () => {
  const W = 900, H = 520;
  const cx = W * 0.40, cy = H * 0.56;
  const rT = 180, rS = 120, rO = 70;

  const Card = ({ y, title, value, note }:{ y:number; title:string; value:string; note:string }) => (
    <g>
      <rect x={W*0.58} y={y-32} width={W*0.36} height={84} rx={12} fill="#fff" stroke="#e6eefb" />
      <text x={W*0.76} y={y-8} textAnchor="middle" style={{fill:"#1b2e58",fontWeight:800,fontSize:16}}>{title}</text>
      <text x={W*0.76} y={y+16} textAnchor="middle" style={{fill:"#2b7cff",fontWeight:900,fontSize:18}}>{value}</text>
      <text x={W*0.76} y={y+36} textAnchor="middle" style={{fill:"#5a6f96",fontSize:12}}>{note}</text>
    </g>
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" aria-label="Market sizing TAM/SAM/SOM">
      <rect x="0" y="0" width={W} height={H} rx="22" fill="#fff" stroke="#e7effa" />

      {/* Rings */}
      <g>
        <circle cx={cx} cy={cy} r={rT} fill="#f2f7ff" stroke="#dfeaff" />
        <circle cx={cx} cy={cy} r={rS} fill="#e7f0ff" stroke="#d3e2ff" />
        <circle cx={cx} cy={cy} r={rO} fill="#d9e8ff" stroke="#c8ddff" />
        <text x={cx} y={cy - rT - 14} textAnchor="middle" style={{fill:"#243b6b",fontWeight:900,fontSize:16}}>Market Opportunity</text>
        <text x={cx} y={cy + 6} textAnchor="middle" style={{fill:"#1b2e58",fontWeight:800,fontSize:14}}>SOM</text>
        <text x={cx} y={cy - rS + 18} textAnchor="middle" style={{fill:"#1b2e58",fontWeight:800,fontSize:14}}>SAM</text>
        <text x={cx} y={cy - rT + 22} textAnchor="middle" style={{fill:"#1b2e58",fontWeight:800,fontSize:14}}>TAM</text>
      </g>

      {/* Right-side cards with your numbers/assumptions */}
      <Card y={H*0.34} title="TAM (macro)" value="≈ $55–60B (2030)" note="Warehouse automation: LogisticsIQ • Grand View" />
      <Card y={H*0.52} title="SAM (top-down)" value="≈ $2–4B (NA+EU)" note="Inventory intel & twin software wedge" />
      <Card y={H*0.70} title="SAM (bottom-up)" value="≈ $0.4–0.84B" note="8–12k sites × $50–70k ACV" />
      <Card y={H*0.86} title="SOM (3–4 yrs)" value="≈ $12M ARR" note="~200 sites × ~$60k ACV" />
    </svg>
  );
};

/* ===========================
   Slides  (Market moved before Competition; Appendix added)
=========================== */
function makeSlides(next: (index: number) => void): Slide[] {
  // quick jump to appendix
  const jumpAppendix: Cta = { label: "Skip to Appendix", onClick: () => next(13) };

  return [
    // 0 — VIDEO COVER
    {
      tag: "VAYUMETRICS",
      visual: <VideoHero />,
      bullets: ["Autonomous drone scanning • Real-time inventory • Spatial 3D twin"],
      ctas: [
        { label: "Enter deck →", primary: true, onClick: () => next(1) },
        { label: "Executive summary", href: asset("whitepaper.html") },
        jumpAppendix,
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
      visual: <img className="visual-img" src={asset("3Dt.png")} alt="3Dt" />,
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

    // 5 — BENEFITS 1
    {
      tag: "BENEFITS",
      title: "Measurable impact from week one",
      visual: <img className="visual-img" src={asset("B1.png")} alt="Benefits" />,
    },

    // 6 — BENEFITS 2
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

    // 8 — MARKET (moved here)
    {
      tag: "MARKET",
      title: "TAM · SAM · SOM (top-down + bottom-up)",
      bullets: [
        "TAM (automation) ≈ $55–60B by 2030 (LogisticsIQ, Grand View).",
        "SAM (NA+EU software wedge) ≈ $2–4B; cross-check bottom-up ≈ $0.4–0.84B.",
        "SOM (3–4 yrs) ≈ $12M ARR (≈200 sites × ~$60k).",
      ],
      visual: <MarketSizing />,
      footnote:
        "Sources: LogisticsIQ • Grand View Research • Global Market Insights (WMS) • BLS QCEW • US Census • Statista (via WarehouseWiz). Assumptions: 30–40% mid/large DCs; Vision-first $50–70k ACV; ranges include caps & volume discounts.",
      ctas: [jumpAppendix],
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

    // 10 — PRICING
    {
      tag: "PRICING",
      title: "Two SKUs & usage that tracks value",
      className: "pricing",
      bullets: ["90-day paid pilot with opt-to-buy credit to Year-1."],
      visual: (
        <div className="price-grid">
          {/* Vision */}
          <article className="price-card vision" aria-label="Vision plan">
            <span className="badge">VISION</span>
            <h3>Camera-first coverage</h3>
            <div className="price">$18k–$24k / site / yr</div>
            <ul className="features">
              <li>Night scans; zero disruption</li>
              <li>WMS reconciliation &amp; reports</li>
              <li>Usage-based — capped</li>
            </ul>
            <div className="card-foot">
              <span className="hint">Best for single-site or pilots</span>
            </div>
          </article>

          {/* Pro */}
          <article className="price-card pro" aria-label="Pro (LiDAR) plan">
            <span className="badge">PRO (LiDAR)</span>
            <h3>Highest accuracy &amp; coverage</h3>
            <div className="price">$36k+ / site / yr</div>
            <ul className="features">
              <li>Spatial 3D twin + shelf state</li>
              <li>Advanced exception workflows</li>
              <li>Usage-based — capped</li>
            </ul>
            <div className="card-foot">
              <span className="hint">Multi-aisle / multi-site scale</span>
            </div>
          </article>
        </div>
      ),
    },

    // 11 — ROI
    {
      tag: "ROI",
      title: "Back-of-the-envelope ROI",
      className: "roi-below",
      visual: <ROI />,
      bullets: ["Adjust locations, cycles, and rates to match your site."],
    },

    // 12 — TEAM
    {
      tag: "TEAM",
      title: "Neel Desai — Founder & CEO",
      bullets: [
        "Founder, Vayumetrics • Logistics Engineer, Volvo Mack Trucks",
        "M.Eng. Engineering Management, B.S. Mechanical Engineering — Lean Six Sigma GB certified",
        "Process optimization & product design; hands-on with SolidWorks, AutoCAD, CNC programming",
        'LinkedIn: <a href="https://www.linkedin.com/in/neel-arvind-desai/" target="_blank">linkedin.com/in/neel-arvind-desai</a>',
        'Email: <a href="mailto:neel8636@gmail.com">neel8636@gmail.com</a>',
        "Phone: +1 (781)-824-1614",
      ],
      visual: <img className="founder" src={asset("Neel_ph.jpg")} alt="Neel Desai" />,
      ctas: [jumpAppendix],
    },

    // 13 — APPENDIX (NEW)
    {
      tag: "APPENDIX",
      title: "Appendix — Sources, Notes & Technical Plans",
      bullets: [
        // External-facing links: these assume your files are in /public/research/
        `Nokia / Sientis AIMS market & ROI study — <a href="${research("67d9873632b36fece9b609d8_Nokia Autonomous Inventory Monitoring Service Report_compressed.pdf")}" target="_blank">PDF</a>`,
        `Business model draft for Smart Inventory System — <a href="${research("Business Model for Smart Inventory System.docx")}" target="_blank">DOCX</a>`,
        `Camera system vs. drone system (cost-benefit) — <a href="${research("CAMERA SYSTEM vs DRONE SYSTEM.docx")}" target="_blank">DOCX</a>`,
        `Detailed plan: drone, scale, backend components — <a href="${research("Detailed Plan for Smart Inventory System Components.docx")}" target="_blank">DOCX</a>`,
        `Gartner: Supply Chain Operational Technology (2024/25) — <a href="${research("Gartner Report.pdf")}" target="_blank">PDF</a>`,
        `Smart Drone Inventory System Guide — <a href="${research("Smart_Drone_Inventory_System_Guide.docx")}" target="_blank">DOCX</a>`,
      ],
      footnote:
        "Notes: Sources inform TAM/SAM/SOM ranges and product/ops assumptions. Place these files in /public/research/ to keep links working.",
      visual: (
        <div className="appendix-grid">
          <div className="apx-card">
            <h4>Market Sizing Notes</h4>
            <ul>
              <li>Top-down TAM anchors from warehouse automation analysts.</li>
              <li>Bottom-up cross-check: NA/EU targetable sites × blended ACV.</li>
              <li>Ranges reflect Vision-first mix, caps, and multi-site discounts.</li>
            </ul>
          </div>
          <div className="apx-card">
            <h4>Technical Roadmap</h4>
            <ul>
              <li>Vision + LiDAR capture; WMS reconciliation; exception workflows.</li>
              <li>Optional scale integration for weight cross-check.</li>
              <li>Night ops SOPs; safety & privacy guardrails; audit logs.</li>
            </ul>
          </div>
          <div className="apx-card">
            <h4>Next Proof Points</h4>
            <ul>
              <li>Partner-verified eligible sites by WMS and size band.</li>
              <li>Pilot KPIs → conversion by vertical and footprint.</li>
              <li>ACV histogram by SKU and usage tier.</li>
            </ul>
          </div>
        </div>
      ),
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

  // Keyboard nav + hash sync
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
    const id = setTimeout(() => {
      if (location.hash !== `#${i}`) history.replaceState(null, "", `#${i}`);
    }, 0);
    return () => clearTimeout(id);
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
          {/* Website hosted separately */}
          <a href="/site/">Website</a>
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

        <article className={`card ${s.className ?? ""}`}>
          {s.title && <h1 className="title">{s.title}</h1>}

          <div className={`grid ${s.visual && hasText ? "has-visual" : ""}`}>
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
