// Minimal inline icon set for the 3toOne Dev category.
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true
};

const Svg = ({ children, size = 20, ...rest }) => (
  <svg {...base} width={size} height={size} {...rest}>
    {children}
  </svg>
);

export const Icons = {
  Brand: (props) => (
    <Svg {...props} strokeWidth={2.2}>
      <path d="M9.5 6.5 4.8 12l4.7 5.5" />
      <path d="M14.5 6.5 19.2 12l-4.7 5.5" />
    </Svg>
  ),
  ArrowLeft: (props) => (
    <Svg {...props}>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </Svg>
  ),
  ArrowRight: (props) => (
    <Svg {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  ),
  ArrowUpRight: (props) => (
    <Svg {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </Svg>
  ),
  Braces: (props) => (
    <Svg {...props}>
      <path d="M8 4c-2 0-2 1.6-2 3.2v2C6 11 5 12 4 12c1 0 2 1 2 2.8v2C6 18.4 6 20 8 20" />
      <path d="M16 4c2 0 2 1.6 2 3.2v2c0 1.8 1 2.8 2 2.8-1 0-2 1-2 2.8v2c0 1.6 0 3.2-2 3.2" />
    </Svg>
  ),
  Code: (props) => (
    <Svg {...props}>
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
      <path d="m14 5-4 14" />
    </Svg>
  ),
  Key: (props) => (
    <Svg {...props}>
      <circle cx="8" cy="15" r="4" />
      <path d="m10.8 12.2 7.4-7.4" />
      <path d="m16 7 2 2" />
      <path d="m13.5 4.5 2 2" />
    </Svg>
  ),
  Check: (props) => (
    <Svg {...props}>
      <path d="m4 12.5 5 5 11-11" />
    </Svg>
  ),
  Copy: (props) => (
    <Svg {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H6a2 2 0 0 0-2 2v7" />
    </Svg>
  ),
  Download: (props) => (
    <Svg {...props}>
      <path d="M12 4v11" />
      <path d="m7.5 11 4.5 4.5L16.5 11" />
      <path d="M5 19h14" />
    </Svg>
  ),
  Upload: (props) => (
    <Svg {...props}>
      <path d="M12 16V5" />
      <path d="m7.5 9 4.5-4.5L16.5 9" />
      <path d="M5 19h14" />
    </Svg>
  ),
  Trash: (props) => (
    <Svg {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="m6 7 1 12h10l1-12" />
      <path d="M10 11v4M14 11v4" />
    </Svg>
  ),
  Wand: (props) => (
    <Svg {...props}>
      <path d="m5 19 9-9" />
      <path d="m14 10 4 4" />
      <path d="M15 4v3M19.5 7.5 17.5 9M20 12h-3" />
    </Svg>
  ),
  Link: (props) => (
    <Svg {...props}>
      <path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7L11.5 7" />
      <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 0 0 5.7 5.7L12.5 17" />
    </Svg>
  ),
  Shield: (props) => (
    <Svg {...props}>
      <path d="M12 3 5 6v6c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  ),
  Bolt: (props) => (
    <Svg {...props}>
      <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" />
    </Svg>
  ),
  Keyboard: (props) => (
    <Svg {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" />
    </Svg>
  ),
  Clock: (props) => (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Svg>
  ),
  Alert: (props) => (
    <Svg {...props}>
      <path d="M12 4 3.5 19h17L12 4Z" />
      <path d="M12 9.5v4" />
      <path d="M12 16.5h.01" />
    </Svg>
  ),
  File: (props) => (
    <Svg {...props}>
      <path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-6-6Z" />
      <path d="M13 3v6h6" />
    </Svg>
  ),
  Paste: (props) => (
    <Svg {...props}>
      <path d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="2.5" width="6" height="4" rx="1.3" />
    </Svg>
  ),
  Swap: (props) => (
    <Svg {...props}>
      <path d="M4 8h14l-3-3" />
      <path d="M20 16H6l3 3" />
    </Svg>
  ),
  External: (props) => (
    <Svg {...props}>
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </Svg>
  )
};

export default Icons;
