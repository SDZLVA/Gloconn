/**
 * Milestone 32 — the home hero background: an original drawn coastal scene
 * (sunrise sky, sea, cliffs, white houses with blue domes). Pure SVG, so no
 * photo licence or extra download; the left side stays pale for the text.
 */
export function HeroScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1600 760"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dbe7f7" />
          <stop offset="0.45" stopColor="#f6e3d0" />
          <stop offset="0.75" stopColor="#f8d9b8" />
          <stop offset="1" stopColor="#f3c9a3" />
        </linearGradient>
        <radialGradient id="hs-sun" cx="0.3" cy="0.52" r="0.35">
          <stop offset="0" stopColor="#fff6e6" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff6e6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hs-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7aa7cf" />
          <stop offset="0.5" stopColor="#3f78b0" />
          <stop offset="1" stopColor="#1e4f86" />
        </linearGradient>
        <linearGradient id="hs-cliff" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a6a5c" />
          <stop offset="1" stopColor="#4e3a36" />
        </linearGradient>
        <linearGradient id="hs-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9a3a3" />
          <stop offset="1" stopColor="#8f7b80" />
        </linearGradient>
        <linearGradient id="hs-dome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="hs-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.7" stopColor="#f8fafc" stopOpacity="0" />
          <stop offset="1" stopColor="#f8fafc" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="hs-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f8fafc" stopOpacity="0.75" />
          <stop offset="0.45" stopColor="#f8fafc" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="1600" height="760" fill="url(#hs-sky)" />
      <rect width="1600" height="760" fill="url(#hs-sun)" />

      {/* Distant island and soft clouds */}
      <path d="M520 410 C620 370 720 360 860 372 C960 380 1040 395 1100 410 L1100 430 L520 430 Z" fill="url(#hs-far)" opacity="0.8" />
      <g fill="#ffffff" opacity="0.55">
        <ellipse cx="330" cy="150" rx="140" ry="18" />
        <ellipse cx="760" cy="110" rx="190" ry="16" />
        <ellipse cx="1180" cy="170" rx="120" ry="14" />
      </g>

      {/* Sea */}
      <rect y="420" width="1600" height="340" fill="url(#hs-sea)" />
      <g stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round">
        <path d="M80 480 h120 M300 520 h160 M560 470 h110 M700 560 h180 M200 610 h140 M480 650 h200" />
      </g>

      {/* Cliffs on the right */}
      <path d="M960 760 L980 520 C1010 470 1060 430 1130 410 C1220 385 1300 360 1400 330 C1480 306 1550 300 1600 296 L1600 760 Z" fill="url(#hs-cliff)" />

      {/* White houses climbing the cliff */}
      <g fill="#fbfbfa" stroke="#e7e2dc" strokeWidth="1.5">
        {[
          [1060, 470, 70, 46], [1135, 452, 64, 42], [1205, 430, 74, 48], [1285, 408, 60, 40], [1350, 388, 72, 46],
          [1430, 366, 66, 42], [1500, 346, 80, 50], [1090, 520, 80, 52], [1180, 500, 70, 48], [1258, 476, 84, 54],
          [1350, 452, 68, 46], [1425, 430, 76, 50], [1510, 406, 90, 56], [1040, 580, 90, 56], [1140, 566, 80, 52],
          [1230, 546, 90, 58], [1330, 520, 74, 50], [1410, 500, 88, 56], [1505, 478, 95, 60],
        ].map(([x, y, w, h]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="4" />
        ))}
      </g>
      <g fill="#7c8aa3" opacity="0.7">
        {[[1080, 488], [1225, 448], [1372, 406], [1112, 540], [1280, 496], [1450, 450], [1062, 600], [1255, 568], [1432, 520]].map(([x, y]) => (
          <rect key={`w-${x}-${y}`} x={x} y={y} width="12" height="16" rx="3" />
        ))}
      </g>

      {/* Blue domes and a bell tower */}
      <g>
        <rect x="1180" y="392" width="70" height="40" fill="#fbfbfa" />
        <path d="M1172 396 A43 43 0 0 1 1258 396 Z" fill="url(#hs-dome)" />
        <rect x="1212" y="332" width="6" height="22" fill="#e2e8f0" />
        <rect x="1206" y="340" width="18" height="5" fill="#e2e8f0" />
        <rect x="1440" y="318" width="60" height="34" fill="#fbfbfa" />
        <path d="M1432 322 A38 38 0 0 1 1508 322 Z" fill="url(#hs-dome)" />
        <rect x="1312" y="320" width="34" height="70" fill="#fbfbfa" stroke="#e7e2dc" />
        <path d="M1306 324 A23 23 0 0 1 1352 324 Z" fill="url(#hs-dome)" />
      </g>

      {/* Foreground greenery */}
      <path d="M900 760 C940 700 1000 690 1040 720 C1080 680 1150 690 1180 760 Z" fill="#5b7b4a" opacity="0.85" />
      <path d="M0 760 C40 720 110 700 170 730 C220 700 290 710 330 760 Z" fill="#6f8f57" opacity="0.6" />

      <rect width="1600" height="760" fill="url(#hs-left)" />
      <rect width="1600" height="760" fill="url(#hs-fade)" />
    </svg>
  );
}
