// We are now explicitly defining what props this component accepts.
interface LoadingBarProps {
  progress: number;
}

export const LoadingBar = ({ progress }: LoadingBarProps) => {
  return (
    <div className="w-full border-2 border-[var(--border-color)] p-2 space-y-2">
      <p className="text-center text-sm">
        ACCESSING ARCHIVES... [{Math.round(progress)}%]
      </p>
      <div className="w-full h-6 bg-black border border-gray-600">
        <div
          className="h-full bg-[var(--accent-color)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};