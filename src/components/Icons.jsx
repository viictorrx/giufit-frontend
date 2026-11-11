/* eslint-disable react-refresh/only-export-components */
// Ícones SVG leves (substituem os emojis). Todos herdam a cor do texto (currentColor).
const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
};

const make = (children, extra = {}) =>
  function Icone({ size, ...props }) {
    return (
      <svg {...base} {...extra} {...(size ? { width: size, height: size } : {})} {...props}>
        {children}
      </svg>
    );
  };

export const IconCarrinho = make(
  <>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
    <path d="M2.5 3.5h2.7l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6.2" />
  </>,
);
export const IconZap = make(<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />);
export const IconSeta = make(<path d="M5 12h14M13 6l6 6-6 6" />);
export const IconFechar = make(<path d="M6 6l12 12M18 6 6 18" />);
export const IconMenu = make(<path d="M4 7h16M4 12h16M4 17h16" />);
export const IconMais = make(<path d="M12 5v14M5 12h14" />);
export const IconMenos = make(<path d="M5 12h14" />);
export const IconCheck = make(<path d="m5 12.5 4.5 4.5L19 7.5" />);
export const IconPin = make(
  <>
    <path d="M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.800 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </>,
);
export const IconFolha = make(
  <>
    <path d="M5 19c0-8 4-13 14-14 0 9-4 14-12 14" />
    <path d="M5 19c2-4 5-7 9-9" />
  </>,
);
export const IconGelo = make(
  <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5" />,
);
export const IconMicro = make(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <rect x="6" y="8" width="8.5" height="8" rx="1" />
    <path d="M17.5 9v.01M17.5 12v.01M17.5 15v.01" />
  </>,
);
export const IconChat = make(
  <path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.4-4.6A7.5 7.5 0 1 1 20 11.5Z" />,
);
export const IconEstrela = make(
  <path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.6l6.1-.8L12 3.2Z" />,
  { fill: "currentColor", strokeWidth: 1 },
);
export const IconInstagram = make(
  <>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.2 6.8v.01" strokeWidth="2.4" />
  </>,
);
export const IconCamera = make(
  <>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.2-2h6.6l1.2 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.500 1.500h-13A1.500 1.500 0 0 1 4 17.500v-9Z" />
    <circle cx="12" cy="13" r="3.4" />
  </>,
);
export const IconLixeira = make(
  <path d="M4 7h16M9 7V4.500h6V7M6.500 7l.8 12.500h9.400L17.500 7M10 11v5M14 11v5" />,
);
export const IconLapis = make(<path d="m4 20 1-4L16.500 4.500a2.100 2.100 0 0 1 3 3L8 19l-4 1ZM14.500 6.500l3 3" />);
export const IconCadeado = make(
  <>
    <rect x="5" y="10.500" width="14" height="10" rx="2.500" />
    <path d="M8 10.500V8a4 4 0 0 1 8 0v2.500" />
  </>,
);
export const IconOlho = make(
  <>
    <path d="M2.500 12S6 5.500 12 5.500 21.500 12 21.500 12 18 18.500 12 18.500 2.500 12 2.500 12Z" />
    <circle cx="12" cy="12" r="2.800" />
  </>,
);
export const IconOlhoOff = make(
  <path d="M3 3l18 18M10.600 6a9 9 0 0 1 1.400-.1c6 0 9.500 6.100 9.500 6.100a16 16 0 0 1-3.200 3.900M6.600 7.500A16 16 0 0 0 2.500 12S6 18.500 12 18.500a9.500 9.500 0 0 0 4-.9M9.900 9.900a3 3 0 0 0 4.200 4.200" />,
);

// Ilustração própria (sem foto): prato visto de cima, usada enquanto não há fotos.
export function PratoIlustrado({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 240 240" role="img" aria-label="Ilustração de uma marmita fit">
      <defs>
        <radialGradient id="pg-borda" cx="50%" cy="40%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#efe6d2" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="214" rx="86" ry="10" fill="#000" opacity=".07" />
      <circle cx="120" cy="112" r="104" fill="url(#pg-borda)" />
      <circle cx="120" cy="112" r="84" fill="#fffdf8" stroke="#eadfc6" strokeWidth="2" />
      {/* arroz */}
      <g fill="#f4ecd8" stroke="#e5d8b8" strokeWidth="1.500">
        <ellipse cx="86" cy="104" rx="30" ry="24" />
        <ellipse cx="74" cy="118" rx="12" ry="8" />
        <ellipse cx="98" cy="122" rx="10" ry="7" />
      </g>
      {/* frango */}
      <g>
        <rect x="118" y="70" width="52" height="38" rx="16" fill="#d99a4a" transform="rotate(-12 144 89)" />
        <rect x="124" y="76" width="40" height="26" rx="12" fill="#e9b468" transform="rotate(-12 144 89)" />
      </g>
      {/* brócolis */}
      <g fill="#3f8a2a">
        <circle cx="106" cy="150" r="13" />
        <circle cx="120" cy="143" r="12" />
        <circle cx="132" cy="152" r="12" />
        <circle cx="118" cy="158" r="11" fill="#4a9a33" />
        <rect x="114" y="160" width="9" height="12" rx="3" fill="#78b855" />
      </g>
      {/* cenoura */}
      <g fill="#ef8a2d" stroke="#d56f12" strokeWidth="1.500">
        <circle cx="156" cy="132" r="9" />
        <circle cx="170" cy="146" r="8" />
        <circle cx="150" cy="150" r="7" />
      </g>
      {/* folhas */}
      <path d="M62 140c10-14 28-12 34 2-14 6-26 6-34-2Z" fill="#6cb43c" />
      <path d="M64 140c10-4 20-4 30 2" stroke="#4a8c1c" strokeWidth="1.500" fill="none" />
    </svg>
  );
}
