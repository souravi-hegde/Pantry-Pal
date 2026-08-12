import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  suffix?: string;
}

export const KPICard = ({ title, value, icon: Icon, bgColor, iconColor, suffix }: KPICardProps) => {
  return (
    <Card className={`p-6 rounded-3xl shadow-card ${bgColor} border-0`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-foreground/70 mb-2">{title}</p>
          <p className="text-5xl font-bold text-foreground">{value}{suffix && <span className="text-4xl">{suffix}</span>}</p>
        </div>
        <div className={`w-14 h-14 rounded-2xl ${iconColor} flex items-center justify-center`}>
          <Icon className="w-7 h-7" strokeWidth={1.5} />
        </div>
      </div>
    </Card>
  );
};
