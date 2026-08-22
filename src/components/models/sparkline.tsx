export function Sparkline({
  points,
  className,
}: {
  points: number[];
  className?: string;
}) {
  if (points.length < 2) return null;

  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;

  const path = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 30 - ((value - min) / span) * 28;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      className={className}
      role="img"
      aria-label="Downloads over the last month"
    >
      <path d={`${path} L100,30 L0,30 Z`} className="fill-primary/15" stroke="none" />
      <path
        d={path}
        className="stroke-primary"
        fill="none"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
