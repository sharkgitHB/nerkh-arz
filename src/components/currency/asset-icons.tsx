// SVG icons for crypto assets & coins - rendered as React components
// All icons designed to look good at small sizes (24-48px)

interface IconProps {
  className?: string;
}

// Bitcoin - official Bitcoin "B" with vertical lines
export function BitcoinIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <path
        fill="#fff"
        d="M23.19 14.02c.27-1.79-.95-2.75-2.57-3.4l.53-2.13-1.3-.32-.51 2.07c-.34-.09-.69-.16-1.04-.24l.51-2.08-1.3-.32-.53 2.13c-.28-.07-.56-.13-.83-.19l-.01-.01-1.79-.45-.34 1.39s.97.22.95.23c.53.13.63.48.61.76l-.61 2.43c.04.01.08.02.13.04l-.13-.03-.85 3.41c-.06.16-.23.41-.59.32.01.02-.96-.24-.96-.24l-.65 1.5 1.69.42c.31.08.62.16.92.24l-.54 2.15 1.3.32.53-2.13c.36.1.7.19 1.04.27l-.53 2.12 1.3.32.54-2.15c2.22.42 3.89.25 4.59-1.76.57-1.62-.03-2.55-1.2-3.16.85-.2 1.5-.76 1.68-1.93zM20.4 19.78c-.41 1.62-3.18.74-4.07.52l.73-2.91c.9.22 3.76.66 3.34 2.39zm.41-4.04c-.37 1.49-2.67.73-3.42.55l.66-2.64c.74.18 3.14.53 2.76 2.09z"
      />
    </svg>
  );
}

// Ethereum - diamond shape
export function EthereumIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <g fill="#fff" fillRule="nonzero">
        <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z" />
        <path d="M16.498 4L9 16.22l7.498-3.35z" />
        <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z" />
        <path d="M16.498 27.995v-6.028L9 17.616z" />
        <path fillOpacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z" />
        <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z" />
      </g>
    </svg>
  );
}

// Tether (USDT) - green circle with white T
export function TetherIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#26A17B" />
      <path
        fill="#fff"
        d="M17.92 17.39v-1.93h6.06v-2.93H8.02v2.93h6.06v1.93c-3.92.18-6.87.96-6.87 1.9 0 .93 2.95 1.71 6.87 1.89v6.93h3.84v-6.93c3.92-.18 6.86-.96 6.86-1.89 0-.93-2.94-1.71-6.86-1.89zm0 3.2v-.01c-.04 0-.53.03-1.92.03-1.32 0-2.23-.02-2.55-.03v.01c-3.15-.14-5.5-.69-5.5-1.34 0-.65 2.35-1.19 5.5-1.33v2.13c.33.02 1.26.07 2.57.07 1.42 0 1.88-.05 1.92-.07v-2.13c3.14.14 5.49.69 5.49 1.33 0 .65-2.35 1.2-5.49 1.34z"
      />
    </svg>
  );
}

// BNB - yellow diamond
export function BnbIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
      <path
        fill="#fff"
        d="M12.12 14.46L16 10.58l3.88 3.88 2.26-2.26L16 6.06l-6.14 6.14 2.26 2.26zM6.06 16l2.26-2.26L10.58 16l-2.26 2.26L6.06 16zm6.06 1.54L16 21.42l3.88-3.88 2.26 2.26L16 25.94l-6.14-6.14.01-.01 2.25-2.25zM21.42 16l2.26-2.26L25.94 16l-2.26 2.26L21.42 16zm-3.13-.01L20.32 14l-1.79-1.79-1.31 1.31-.15.15-.78.78-1.18 1.18 1.18 1.18L16 17.4l1.31-1.31z"
      />
    </svg>
  );
}

// XRP - black circle with X
export function XrpIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#23292F" />
      <path
        fill="#fff"
        d="M23.07 8h2.92l-6.04 5.97c-2.16 2.13-5.66 2.13-7.82 0L6.07 8H9l4.55 4.49c1.36 1.34 3.56 1.34 4.92 0L23.07 8zM8.97 24.07H6.05l6.06-5.99c2.16-2.13 5.66-2.13 7.82 0l6.06 5.99h-2.93l-4.55-4.5c-1.36-1.34-3.56-1.34-4.92 0l-4.58 4.5z"
      />
    </svg>
  );
}

// Solana - gradient
export function SolanaIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#000" />
      <defs>
        <linearGradient id="sol-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="100%" stopColor="#14F195" />
        </linearGradient>
      </defs>
      <path
        fill="url(#sol-grad)"
        d="M9.43 20.36c.18-.18.43-.28.69-.28h13.6c.43 0 .65.52.34.83l-2.69 2.69a.97.97 0 01-.69.28H7.08c-.43 0-.65-.52-.34-.83l2.69-2.69zm0-10.95c.19-.18.43-.28.69-.28h13.6c.43 0 .65.52.34.83l-2.69 2.69a.97.97 0 01-.69.28H7.08c-.43 0-.65-.52-.34-.83l2.69-2.69zm2.65 5.47c.18-.18.43-.28.69-.28h13.6c.43 0 .65.52.34.83l-2.69 2.69a.97.97 0 01-.69.28H9.74c-.43 0-.65-.52-.34-.83l2.69-2.69z"
      />
    </svg>
  );
}

// Dogecoin
export function DogeIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#C2A633" />
      <path
        fill="#fff"
        d="M13.43 9.04h4.16c1.83 0 3.32.5 4.45 1.5 1.13 1 1.7 2.45 1.7 4.34v2.2c0 1.9-.57 3.34-1.7 4.34-1.13 1-2.62 1.5-4.45 1.5h-4.16c-.27 0-.4-.13-.4-.4V9.44c0-.27.13-.4.4-.4zm2.5 3.13v7.42h1.5c.82 0 1.46-.25 1.91-.74.45-.5.68-1.2.68-2.1v-1.74c0-.9-.23-1.6-.68-2.1-.45-.5-1.09-.74-1.91-.74h-1.5z"
      />
    </svg>
  );
}

// Generic gold coin icon - for Emami / Azadi coin
export function CoinIcon({
  className = "h-6 w-6",
  color = "#F59E0B",
}: IconProps & { color?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill={color} />
      <circle cx="16" cy="16" r="13" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.4" />
      <path
        fill="#fff"
        d="M16 7.2c-.4 0-.74.29-.82.68l-.21 1.1a7.2 7.2 0 00-1.6.67l-.92-.65a.84.84 0 00-1.06.1l-.94.94a.84.84 0 00-.1 1.06l.65.92c-.27.5-.49 1.04-.67 1.6l-1.1.21a.84.84 0 00-.68.82v1.32c0 .4.29.74.68.82l1.1.21c.18.56.4 1.1.67 1.6l-.65.92a.84.84 0 00.1 1.06l.94.94c.28.28.72.32 1.06.1l.92-.65c.5.27 1.04.49 1.6.67l.21 1.1c.08.39.42.68.82.68h1.32c.4 0 .74-.29.82-.68l.21-1.1c.56-.18 1.1-.4 1.6-.67l.92.65c.34.22.78.18 1.06-.1l.94-.94a.84.84 0 00.1-1.06l-.65-.92c.27-.5.49-1.04.67-1.6l1.1-.21c.39-.08.68-.42.68-.82v-1.32a.84.84 0 00-.68-.82l-1.1-.21a7.2 7.2 0 00-.67-1.6l.65-.92a.84.84 0 00-.1-1.06l-.94-.94a.84.84 0 00-1.06-.1l-.92.65a7.2 7.2 0 00-1.6-.67l-.21-1.1a.84.84 0 00-.82-.68H16zm.66 4.5a4.3 4.3 0 110 8.6 4.3 4.3 0 010-8.6z"
      />
    </svg>
  );
}

// Gold ingot icon - for ounce
export function GoldIngotIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#F59E0B" />
      <path
        fill="#fff"
        d="M8 14.5h16l-1 5.5a1 1 0 01-1 .8H10a1 1 0 01-1-.8l-1-5.5zm2-2.5l1.2-1.6a1 1 0 01.8-.4h7.6a1 1 0 01.8.4L22 12v.5H10V12zm-2 3h20l-.4 1.5H8.4L8 14.5z"
      />
    </svg>
  );
}

// Silver ingot
export function SilverIngotIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#94A3B8" />
      <path
        fill="#fff"
        d="M8 14.5h16l-1 5.5a1 1 0 01-1 .8H10a1 1 0 01-1-.8l-1-5.5zm2-2.5l1.2-1.6a1 1 0 01.8-.4h7.6a1 1 0 01.8.4L22 12v.5H10V12zm-2 3h20l-.4 1.5H8.4L8 14.5z"
      />
    </svg>
  );
}

// Platinum
export function PlatinumIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#A8A8A8" />
      <path
        fill="#fff"
        d="M16 6l-7 4v12l7 4 7-4V10l-7-4zm0 2.3l5 2.85v9.7l-5 2.85-5-2.85v-9.7l5-2.85z"
      />
    </svg>
  );
}

// Palladium
export function PalladiumIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#10B981" />
      <path
        fill="#fff"
        d="M11 8h6c2.2 0 4 1.8 4 4 0 1.7-1 3.1-2.5 3.7L21 24h-3l-2.4-8H14v8h-3V8zm3 2.5v3h2.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5H14z"
      />
    </svg>
  );
}

// Lookup helper
export const CRYPTO_ICONS: Record<string, React.FC<IconProps>> = {
  btc: BitcoinIcon,
  eth: EthereumIcon,
  usdt: TetherIcon,
  bnb: BnbIcon,
  xrp: XrpIcon,
  sol: SolanaIcon,
  doge: DogeIcon,
};
