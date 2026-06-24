interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  color?: string;
}

export function ProgressBar({ value, showLabel = true, size = 'sm', color }: ProgressBarProps) {
  const getColor = () => {
    if (color) return color;
    if (value >= 80) return '#5DA832';
    if (value >= 50) return '#3EEEFF';
    if (value >= 25) return '#FFAA00';
    return '#CC0000';
  };

  const barColor = getColor();

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-[#21262D] rounded-sm overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2.5'}`}>
        <div
          className="h-full rounded-sm transition-all duration-700 ease-out"
          style={{
            width: `${value}%`,
            backgroundColor: barColor,
            boxShadow: `0 0 8px ${barColor}60`,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono min-w-[2.5rem] text-right" style={{ color: barColor }}>
          {value}%
        </span>
      )}
    </div>
  );
}
