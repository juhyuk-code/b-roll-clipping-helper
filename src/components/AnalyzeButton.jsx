export default function AnalyzeButton({ disabled, loading, progress, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-accent-blue text-white hover:bg-accent-blue/80"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Analyzing... ({progress.current}/{progress.total})
        </span>
      ) : (
        'Analyze'
      )}
    </button>
  );
}
