/** Formats a duration in minutes as "Xh Ym". */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

type ResultDurationProps = {
  minutes: number;
  className?: string;
};

/** Duration label for transport result cards. */
export function ResultDuration({ minutes, className }: ResultDurationProps) {
  return (
    <span className={className}>{formatDuration(minutes)}</span>
  );
}
