/* Stylised renditions of the National Emblem and the BhoomiVerify AI mark.
   Drawn as inline SVG so they scale crisply and inherit theme colours. */

export function NationalEmblem({ className = "h-12 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 148" className={className} role="img" aria-label="National Emblem of India">
      <g fill="#1a2b45">
        {/* side lions */}
        <path d="M31 74c-5-3-8-9-8-16 0-8 4-14 10-17 1-5 5-9 10-10l3 12-6 6c-4 3-6 8-6 13z" />
        <path d="M89 74c5-3 8-9 8-16 0-8-4-14-10-17-1-5-5-9-10-10l-3 12 6 6c4 3 6 8 6 13z" />
        {/* central lion */}
        <path d="M60 20c8 0 14 6 15 14l5 3c3 2 5 6 5 10 0 6-3 11-8 14l-4 13H47l-4-13c-5-3-8-8-8-14 0-4 2-8 5-10l5-3c1-8 7-14 15-14z" />
        {/* mane detail */}
        <path
          d="M52 34c2-3 5-5 8-5s6 2 8 5c1 2 1 4 0 6-2-2-5-3-8-3s-6 1-8 3c-1-2-1-4 0-6z"
          fill="#f4f7fb"
          opacity="0.55"
        />
        {/* eyes / muzzle */}
        <circle cx="54" cy="42" r="1.9" fill="#f4f7fb" />
        <circle cx="66" cy="42" r="1.9" fill="#f4f7fb" />
        <path d="M57 48h6l-3 4z" fill="#f4f7fb" />
        {/* abacus */}
        <rect x="25" y="76" width="70" height="17" rx="2.5" />
        <circle cx="60" cy="84.5" r="6.6" fill="#f4f7fb" />
        <circle cx="60" cy="84.5" r="4.6" />
        <g stroke="#f4f7fb" strokeWidth="0.7">
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <line
                key={i}
                x1={60 + Math.cos(a) * 1.6}
                y1={84.5 + Math.sin(a) * 1.6}
                x2={60 + Math.cos(a) * 4.3}
                y2={84.5 + Math.sin(a) * 4.3}
              />
            );
          })}
        </g>
        {/* bull + horse silhouettes on the abacus */}
        <path d="M33 89c0-4 2-6 5-6s4 2 4 4v2z" fill="#f4f7fb" opacity="0.85" />
        <path d="M87 89c0-4-2-6-5-6s-4 2-4 4v2z" fill="#f4f7fb" opacity="0.85" />
        {/* bell-shaped lotus base */}
        <path d="M30 95h60l-4 8H34z" />
        <path d="M60 124c-13 0-23-6-27-14h54c-4 8-14 14-27 14z" />
        <path d="M36 105h48l-3 5H39z" fill="#f4f7fb" opacity="0.35" />
      </g>
      <text
        x="60"
        y="140"
        textAnchor="middle"
        fontFamily="'Noto Sans Devanagari', serif"
        fontSize="13"
        fontWeight="700"
        fill="#1a2b45"
      >
        सत्यमेव जयते
      </text>
    </svg>
  );
}

export function BhoomiLogo({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="BhoomiVerify AI logo">
      <defs>
        <linearGradient id="bvaRing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1f56b0" />
          <stop offset="55%" stopColor="#2f8f5b" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="bvaField" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#bvaRing)" />
      <circle cx="32" cy="32" r="25" fill="#ffffff" />
      {/* land parcels */}
      <path d="M11 40 L24 31 L36 38 L53 27 L53 44 A25 25 0 0 1 11 44 Z" fill="url(#bvaField)" />
      <g stroke="#ffffff" strokeWidth="1.1" opacity="0.75">
        <path d="M18 45 L26 34" />
        <path d="M28 47 L33 37" />
        <path d="M40 47 L42 36" />
      </g>
      {/* shield + check */}
      <path
        d="M32 12 L45 17 V29 C45 38 39 45 32 48 C25 45 19 38 19 29 V17 Z"
        fill="#1f56b0"
        opacity="0.95"
      />
      <path
        d="M32 14.6 L42.6 18.7 V29 C42.6 36.4 37.8 42.4 32 45.2 C26.2 42.4 21.4 36.4 21.4 29 V18.7 Z"
        fill="#ffffff"
      />
      <path
        d="M26 29.5 L30.4 34 L38.6 24.5"
        fill="none"
        stroke="#16a34a"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NicMark({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 40" className={className} role="img" aria-label="National Informatics Centre">
      <g fill="currentColor">
        <rect x="2" y="8" width="24" height="24" rx="4" opacity="0.18" />
        <path d="M8 26 L14 14 L20 26 Z" />
        <circle cx="14" cy="22" r="2.4" fill="#ffffff" />
      </g>
      <text x="34" y="19" fontSize="11" fontWeight="700" fill="currentColor" fontFamily="inherit">
        NATIONAL INFORMATICS
      </text>
      <text x="34" y="31" fontSize="11" fontWeight="700" fill="currentColor" fontFamily="inherit">
        CENTRE
      </text>
    </svg>
  );
}
