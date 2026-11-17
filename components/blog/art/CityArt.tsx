/**
 * Milestone 63b — original flat illustrations for blog posts (no photos, so
 * no licences to manage, and nothing to download). Inline SVG: sharp on
 * every screen, tiny, and allowed by the CSP. One consistent style: gradient
 * sky, a landmark silhouette, light details.
 */

type ArtProps = { className?: string };
const frame = "block h-auto w-full";

function Snow({ seed = 1, count = 40, color = "#ffffff" }: { seed?: number; count?: number; color?: string }) {
  // Deterministic "random" flakes so server and browser render the same.
  const flakes = Array.from({ length: count }, (_, i) => {
    const a = Math.sin((i + 1) * 12.9898 * seed) * 43758.5453;
    const b = Math.sin((i + 1) * 78.233 * seed) * 12345.6789;
    return { x: (a - Math.floor(a)) * 800, y: (b - Math.floor(b)) * 300, r: 1.2 + ((a * 7) % 1 + 1) % 1 * 2.2 };
  });
  return (
    <g fill={color} opacity="0.85">
      {flakes.map((f, i) => (
        <circle key={i} cx={f.x.toFixed(1)} cy={f.y.toFixed(1)} r={f.r.toFixed(1)} />
      ))}
    </g>
  );
}

/** Milan → the world: Duomo spires and a plane. */
export function MilanHeroArt({ className }: ArtProps) {
  const spires = [150, 190, 230, 270, 310, 350, 400, 450, 490, 530, 570, 610, 650];
  return (
    <svg viewBox="0 0 800 360" className={`${frame} ${className ?? ""}`} role="img" aria-label="Illustration: Milan Cathedral and a plane flying away">
      <defs>
        <linearGradient id="mh-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e3a8a" />
          <stop offset="0.55" stopColor="#2563eb" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <rect width="800" height="360" fill="url(#mh-sky)" />
      <circle cx="640" cy="250" r="70" fill="#fde68a" opacity="0.9" />
      <path d="M80 250 Q 360 40 700 90" fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray="10 12" opacity="0.8" />
      <g transform="translate(690 80) rotate(-12)" fill="#ffffff">
        <path d="M-34 0 L30 -4 Q40 0 30 4 L-34 0 Z" />
        <path d="M-6 -2 L-22 -26 L-12 -26 L8 -2 Z" />
        <path d="M-6 2 L-22 26 L-12 26 L8 2 Z" />
        <path d="M-30 -1 L-38 -12 L-32 -12 L-24 -1 Z" />
      </g>
      <g fill="#f8fafc">
        <rect x="140" y="250" width="520" height="80" />
        <path d="M330 250 L400 175 L470 250 Z" />
        <rect x="392" y="120" width="16" height="60" />
        <path d="M392 120 L400 96 L408 120 Z" />
        {spires.map((x) => (
          <g key={x}>
            <rect x={x - 4} y={x === 400 ? 200 : 215} width="8" height="40" />
            <path d={`M${x - 4} ${x === 400 ? 200 : 215} L${x} ${x === 400 ? 185 : 198} L${x + 4} ${x === 400 ? 200 : 215} Z`} />
          </g>
        ))}
      </g>
      <g fill="#cbd5e1">
        {[180, 240, 300, 500, 560, 620].map((x) => (
          <path key={x} d={`M${x - 14} 330 V292 Q${x} 272 ${x + 14} 292 V330 Z`} />
        ))}
        <path d="M376 330 V280 Q400 250 424 280 V330 Z" />
      </g>
      <rect y="330" width="800" height="30" fill="#e2e8f0" />
    </svg>
  );
}

/** Budapest: Parliament on the Danube at dusk, snowing. */
export function BudapestArt({ className }: ArtProps) {
  const spires = [190, 230, 270, 310, 490, 530, 570, 610];
  return (
    <svg viewBox="0 0 800 360" className={`${frame} ${className ?? ""}`} role="img" aria-label="Illustration: Budapest Parliament by the Danube in the snow">
      <defs>
        <linearGradient id="bu-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e1b4b" />
          <stop offset="0.6" stopColor="#6d28d9" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <rect width="800" height="360" fill="url(#bu-sky)" />
      <g fill="#fde7c4">
        <rect x="150" y="200" width="500" height="70" />
        <path d="M340 200 Q400 110 460 200 Z" />
        <rect x="396" y="92" width="8" height="40" />
        <path d="M396 92 L400 70 L404 92 Z" />
        {spires.map((x) => (
          <g key={x}>
            <rect x={x - 5} y="165" width="10" height="40" />
            <path d={`M${x - 5} 165 L${x} 140 L${x + 5} 165 Z`} />
          </g>
        ))}
        <rect x="130" y="230" width="40" height="40" />
        <rect x="630" y="230" width="40" height="40" />
      </g>
      <g fill="#f59e0b">
        {Array.from({ length: 22 }, (_, i) => (
          <rect key={i} x={165 + i * 22} y="235" width="8" height="14" rx="2" />
        ))}
      </g>
      <rect y="270" width="800" height="90" fill="#1e3a8a" />
      <g fill="#fde7c4" opacity="0.35">
        <rect x="150" y="280" width="500" height="6" />
        <rect x="200" y="296" width="400" height="5" />
        <rect x="260" y="312" width="280" height="4" />
      </g>
      <Snow seed={1.3} />
    </svg>
  );
}

/** Kraków: St Mary's Basilica and a Christmas market. */
export function KrakowArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 800 360" className={`${frame} ${className ?? ""}`} role="img" aria-label="Illustration: Kraków market square with St Mary's Basilica and Christmas stalls">
      <defs>
        <linearGradient id="kr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f172a" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect width="800" height="360" fill="url(#kr-sky)" />
      <circle cx="120" cy="70" r="26" fill="#fef3c7" />
      <g fill="#b45309">
        <rect x="330" y="150" width="150" height="150" />
        <rect x="300" y="90" width="44" height="210" />
        <path d="M300 90 L322 30 L344 90 Z" />
        <rect x="470" y="130" width="40" height="170" />
        <path d="M466 130 L490 105 L514 130 Z" />
        <path d="M330 150 L405 110 L480 150 Z" />
      </g>
      <g fill="#fde68a">
        <rect x="314" y="120" width="16" height="22" rx="8" />
        <rect x="482" y="150" width="16" height="22" rx="8" />
        <path d="M390 300 V230 Q405 205 420 230 V300 Z" />
      </g>
      <rect y="300" width="800" height="60" fill="#e2e8f0" />
      {[80, 190, 590, 700].map((x) => (
        <g key={x}>
          <rect x={x - 40} y="262" width="80" height="40" fill="#7c2d12" />
          <path d={`M${x - 48} 264 L${x} 236 L${x + 48} 264 Z`} fill="#dc2626" />
          <rect x={x - 30} y="272" width="60" height="16" fill="#fde68a" />
        </g>
      ))}
      <path d="M0 225 Q200 255 400 225 T800 225" fill="none" stroke="#fde68a" strokeWidth="2" />
      <g fill="#fbbf24">
        {Array.from({ length: 16 }, (_, i) => (
          <circle key={i} cx={25 + i * 50} cy={233 + Math.sin(i) * 6} r="4" />
        ))}
      </g>
      <Snow seed={2.7} />
    </svg>
  );
}

/** Lisbon: yellow tram, colourful houses on a hill, winter sun. */
export function LisbonArt({ className }: ArtProps) {
  const houses = [
    { x: 40, w: 90, h: 110, c: "#f97316" },
    { x: 130, w: 80, h: 140, c: "#facc15" },
    { x: 210, w: 100, h: 120, c: "#38bdf8" },
    { x: 310, w: 80, h: 150, c: "#f472b6" },
    { x: 520, w: 90, h: 130, c: "#fb923c" },
    { x: 610, w: 80, h: 105, c: "#a3e635" },
    { x: 690, w: 100, h: 135, c: "#60a5fa" },
  ];
  return (
    <svg viewBox="0 0 800 360" className={`${frame} ${className ?? ""}`} role="img" aria-label="Illustration: a yellow tram in Lisbon under the winter sun">
      <defs>
        <linearGradient id="li-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#fde68a" />
        </linearGradient>
      </defs>
      <rect width="800" height="360" fill="url(#li-sky)" />
      <circle cx="650" cy="80" r="44" fill="#fde047" />
      {houses.map((h) => (
        <g key={h.x}>
          <rect x={h.x} y={290 - h.h} width={h.w} height={h.h} fill={h.c} />
          <path d={`M${h.x - 6} ${290 - h.h} L${h.x + h.w / 2} ${270 - h.h} L${h.x + h.w + 6} ${290 - h.h} Z`} fill="#c2410c" />
          {[0, 1].map((r) => [0, 1].map((c) => (
            <rect key={`${r}${c}`} x={h.x + 14 + c * (h.w / 2)} y={300 - h.h + 18 + r * 40} width="16" height="22" fill="#ffffff" opacity="0.85" />
          )))}
        </g>
      ))}
      <rect y="290" width="800" height="70" fill="#78716c" />
      <rect y="318" width="800" height="4" fill="#d6d3d1" />
      <rect y="334" width="800" height="4" fill="#d6d3d1" />
      <g>
        <rect x="380" y="220" width="200" height="100" rx="14" fill="#facc15" />
        <rect x="380" y="290" width="200" height="14" fill="#ffffff" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={396 + i * 45} y="236" width="34" height="38" rx="4" fill="#bae6fd" />
        ))}
        <path d="M470 220 L480 190 L486 190 L476 220 Z" fill="#334155" />
        <circle cx="420" cy="326" r="10" fill="#334155" />
        <circle cx="540" cy="326" r="10" fill="#334155" />
        <text x="480" y="300" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e3a8a" fontFamily="sans-serif">28</text>
      </g>
    </svg>
  );
}

/** Seville: the Giralda and orange trees. */
export function SevilleArt({ className }: ArtProps) {
  const trees = [130, 260, 560, 690];
  return (
    <svg viewBox="0 0 800 360" className={`${frame} ${className ?? ""}`} role="img" aria-label="Illustration: the Giralda tower in Seville with orange trees">
      <defs>
        <linearGradient id="se-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#fdba74" />
        </linearGradient>
      </defs>
      <rect width="800" height="360" fill="url(#se-sky)" />
      <circle cx="140" cy="80" r="40" fill="#fde047" />
      <g fill="#d97706">
        <rect x="370" y="110" width="60" height="200" />
        <rect x="378" y="75" width="44" height="40" />
        <rect x="386" y="48" width="28" height="30" />
        <path d="M392 48 Q400 28 408 48 Z" />
        <rect x="398" y="14" width="4" height="22" />
      </g>
      <g fill="#fcd34d">
        {[140, 180, 220, 260].map((y) => (
          <rect key={y} x="390" y={y} width="20" height="22" rx="10" />
        ))}
        <rect x="390" y="85" width="20" height="22" rx="10" />
      </g>
      <rect x="0" y="250" width="800" height="60" fill="#fef3c7" />
      <g fill="#fde68a">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M${20 + i * 66} 310 V270 Q${43 + i * 66} 250 ${66 + i * 66} 270 V310 Z`} opacity="0.7" />
        ))}
      </g>
      <rect y="310" width="800" height="50" fill="#a16207" />
      {trees.map((x) => (
        <g key={x}>
          <rect x={x - 6} y="270" width="12" height="45" fill="#78350f" />
          <circle cx={x} cy="250" r="42" fill="#15803d" />
          {[[-18, -12], [14, -20], [20, 8], [-10, 14], [0, -2], [-26, 6]].map(([dx, dy], i) => (
            <circle key={i} cx={x + dx} cy={250 + dy} r="6" fill="#f97316" />
          ))}
        </g>
      ))}
    </svg>
  );
}

/** Athens: the Parthenon on the Acropolis hill. */
export function AthensArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 800 360" className={`${frame} ${className ?? ""}`} role="img" aria-label="Illustration: the Parthenon on the Acropolis in Athens">
      <defs>
        <linearGradient id="at-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>
      <rect width="800" height="360" fill="url(#at-sky)" />
      <circle cx="660" cy="70" r="36" fill="#fde047" />
      <path d="M0 360 V260 Q120 220 220 210 L280 190 L540 190 L600 210 Q700 225 800 250 V360 Z" fill="#a8a29e" />
      <path d="M0 360 V300 Q200 270 400 290 T800 290 V360 Z" fill="#78716c" />
      <g fill="#fafaf9">
        <rect x="290" y="176" width="220" height="14" />
        <rect x="282" y="186" width="236" height="8" />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={298 + i * 27} y="118" width="12" height="60" />
        ))}
        <rect x="290" y="106" width="220" height="14" />
        <path d="M286 106 L400 74 L514 106 Z" />
      </g>
      <g fill="#166534">
        {[90, 130, 690, 730].map((x) => (
          <path key={x} d={`M${x} 300 Q${x - 12} 250 ${x} 210 Q${x + 12} 250 ${x} 300 Z`} />
        ))}
      </g>
    </svg>
  );
}
