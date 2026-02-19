const BADGE_STYLES = {
  high: 'bg-accent-green/10 text-accent-green border-accent-green/20',
  medium: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
  low: 'bg-accent-red/10 text-accent-red border-accent-red/20',
  unverified: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function ConfidenceBadge({ confidence }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border ${
        BADGE_STYLES[confidence] || BADGE_STYLES.unverified
      }`}
    >
      {confidence}
    </span>
  );
}
