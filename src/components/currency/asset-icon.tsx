"use client";

import { useState } from "react";
import {
  BitcoinIcon,
  EthereumIcon,
  TetherIcon,
  BnbIcon,
  XrpIcon,
  SolanaIcon,
  DogeIcon,
  CoinIcon,
  GoldIngotIcon,
  SilverIngotIcon,
  PlatinumIcon,
  PalladiumIcon,
} from "./asset-icons";
import type { IconType } from "@/lib/assets";

interface AssetIconProps {
  icon: IconType;
  color: string;
  size?: number;
  className?: string;
  // Shown when an image icon fails to load (e.g., symbol letter)
  fallback?: string;
}

const SVG_MAP: Record<string, React.FC<{ className?: string }>> = {
  btc: BitcoinIcon,
  eth: EthereumIcon,
  usdt: TetherIcon,
  bnb: BnbIcon,
  xrp: XrpIcon,
  sol: SolanaIcon,
  doge: DogeIcon,
  coin: CoinIcon,
  goldIngot: GoldIngotIcon,
  silverIngot: SilverIngotIcon,
  platinum: PlatinumIcon,
  palladium: PalladiumIcon,
};

export function AssetIcon({
  icon,
  color,
  size = 44,
  className,
  fallback,
}: AssetIconProps) {
  const dim = `${size}px`;
  const wrapClass = `flex-shrink-0 rounded-full flex items-center justify-center text-white shadow-sm overflow-hidden ${className ?? ""}`;
  const [imgError, setImgError] = useState(false);

  const letterFallback = (
    <div
      className={wrapClass}
      style={{
        width: dim,
        height: dim,
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        fontSize: `${size * 0.45}px`,
        fontWeight: 700,
      }}
    >
      <span style={{ lineHeight: 1 }}>{fallback ?? "?"}</span>
    </div>
  );

  // Image icon - direct URL (local flags, AlanChand crypto/gold images)
  if (icon.kind === "image" && !imgError) {
    return (
      <div
        className={wrapClass}
        style={{
          width: dim,
          height: dim,
          background: `linear-gradient(135deg, ${color}33, ${color}66)`,
        }}
      >
        <img
          src={icon.url}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
          loading="lazy"
          style={{ borderRadius: "50%" }}
          onError={() => setImgError(true)}
          // Referrer policy to avoid hotlink protection issues
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (icon.kind === "image" && imgError) {
    return letterFallback;
  }

  if (icon.kind === "emoji") {
    return (
      <div
        className={wrapClass}
        style={{
          width: dim,
          height: dim,
          background: `linear-gradient(135deg, ${color}, ${color}cc)`,
          fontSize: `${size * 0.5}px`,
        }}
      >
        <span style={{ lineHeight: 1 }}>{icon.value}</span>
      </div>
    );
  }

  if (icon.kind === "svg") {
    const Cmp = SVG_MAP[icon.key];
    if (Cmp) {
      return (
        <div
          className={wrapClass}
          style={{
            width: dim,
            height: dim,
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
          }}
        >
          <Cmp className="h-full w-full" />
        </div>
      );
    }
  }

  // Fallback to letter
  return (
    <div
      className={wrapClass}
      style={{
        width: dim,
        height: dim,
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        fontSize: `${size * 0.45}px`,
        fontWeight: 700,
      }}
    >
      <span style={{ lineHeight: 1 }}>
        {icon.kind === "letter" ? icon.value : "?"}
      </span>
    </div>
  );
}
