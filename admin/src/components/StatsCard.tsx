import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  iconBg?: string;
  iconColor?: string;
  delay?: number;
}

export default function StatsCard({
  icon: Icon,
  label,
  value,
  change,
  changeLabel = "هذا الشهر",
  iconBg = "bg-primary-50",
  iconColor = "text-primary-600",
  delay = 0,
}: Props) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className="card p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-scaleIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}
        >
          <Icon size={22} className={iconColor} />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              isPositive
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? "+" : ""}
            {change}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 tabular-nums">
          {typeof value === "number" ? value.toLocaleString("ar-SA") : value}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {change !== undefined && (
          <p className="text-xs text-gray-400 mt-1">{changeLabel}</p>
        )}
      </div>
    </div>
  );
}
