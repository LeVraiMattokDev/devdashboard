import { useState } from 'react';

interface AvatarProps {
  value: string;
  color: string;
  size?: number;
  className?: string;
}

export function Avatar({ value, color, size = 32, className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const isUrl = !imgError && /^https?:\/\//.test(value ?? '');

  const base: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: 4,
    flexShrink: 0,
    border: `1px solid ${color}40`,
  };

  if (isUrl) {
    return (
      <img
        src={value}
        alt=""
        style={{ ...base, objectFit: 'cover' }}
        className={className}
        onError={() => setImgError(true)}
      />
    );
  }

  const fontSize = size <= 20 ? 9 : size <= 32 ? 11 : size <= 48 ? 14 : 18;
  return (
    <div
      style={{ ...base, backgroundColor: `${color}20`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: 'bold' }}
      className={className}
    >
      {(value || '??').slice(0, 2).toUpperCase()}
    </div>
  );
}
