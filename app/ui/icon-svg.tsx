import * as React from 'react'

const ICONS: Record<string, React.ReactNode> = {
  search:   <><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></>,
  cart:     <><path d="M3 5h2l2 12h11l2-9H6"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></>,
  plus:     <path d="M12 5v14M5 12h14"/>,
  minus:    <path d="M5 12h14"/>,
  close:    <path d="M6 6l12 12M18 6L6 18"/>,
  check:    <path d="M5 12l4 4 10-11"/>,
  chevronR: <path d="M9 6l6 6-6 6"/>,
  chevronL: <path d="M15 6l-6 6 6 6"/>,
  chevronD: <path d="M6 9l6 6 6-6"/>,
  arrowL:   <><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></>,
  arrowR:   <><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>,
  arrowUp:  <><path d="M12 19V5"/><path d="M6 11l6-6 6 6"/></>,
  arrowDn:  <><path d="M12 5v14"/><path d="M6 13l6 6 6-6"/></>,
  eye:      <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff:   <><path d="M3 3l18 18"/><path d="M10.6 6.2A10 10 0 0112 6c6.5 0 10 7 10 7a17.5 17.5 0 01-3.4 4M6.3 6.3A17.6 17.6 0 002 13s3.5 7 10 7a10 10 0 004.7-1.2"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/></>,
  user:     <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></>,
  bag:      <><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8a3 3 0 016 0"/></>,
  truck:    <><rect x="2" y="7" width="12" height="9" rx="1"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></>,
  box:      <><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></>,
  layers:   <><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></>,
  store:    <><path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/></>,
  list:     <><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>,
  grid:     <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
  chart:    <><path d="M4 19V5"/><path d="M4 19h16"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="14" width="3" height="3"/></>,
  users:    <><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 20c0-2.5 2-4.5 5-4.5"/></>,
  pin:      <><path d="M12 21s-7-7.5-7-12a7 7 0 1114 0c0 4.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
  filter:   <path d="M3 5h18l-7 9v6l-4-2v-4L3 5z"/>,
  edit:     <path d="M14 4l6 6L9 21H3v-6L14 4z"/>,
  trash:    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>,
  menu:     <path d="M4 7h16M4 12h16M4 17h16"/>,
  bolt:     <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/>,
  warn:     <><path d="M12 4l10 17H2L12 4z"/><path d="M12 11v4M12 17.5v.5"/></>,
  info:     <><circle cx="12" cy="12" r="9"/><path d="M12 8.5v.5M12 12v4.5"/></>,
  history:  <><path d="M3 12a9 9 0 109-9"/><path d="M3 4v5h5"/><path d="M12 8v4l3 2"/></>,
  bell:     <><path d="M6 8a6 6 0 1112 0v5l1.5 3h-15L6 13V8z"/><path d="M9.5 19a2.5 2.5 0 005 0"/></>,
  download: <><path d="M12 4v12"/><path d="M6 12l6 6 6-6"/><path d="M4 20h16"/></>,
  logout:   <><path d="M14 4h5v16h-5"/><path d="M3 12h12"/><path d="M9 7l-6 5 6 5"/></>,
}

export type IconName = keyof typeof ICONS

export default function Icon({
  name,
  size = 18,
  strokeWidth = 1.6,
  className,
}: {
  name: IconName | string
  size?: number
  strokeWidth?: number
  className?: string
}) {
  const node = ICONS[name]
  if (!node) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {node}
    </svg>
  )
}
