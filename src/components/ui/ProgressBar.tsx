interface ProgressBarProps {
  title: string;
  percent: number;
  subtitle: string;
  color?: string;
}

export function ProgressBar({ 
  title, 
  percent, 
  subtitle, 
  color = "bg-emerald-600" 
}: ProgressBarProps) {
  return (
    <div className="space-y-1 text-xs">
      <div className="flex justify-between font-medium">
        <span>{title}</span>
        <span className="text-stone-500">{subtitle}</span>
      </div>
      <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden border border-cozy-card-border">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}