import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

const AnalyticsCard = ({ title, value, icon: Icon, trend, trendUp }: AnalyticsCardProps) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-body text-muted-foreground uppercase tracking-[0.1em]">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-5 w-5 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-brand text-foreground">{value}</div>
        {trend && (
          <p className={`text-xs mt-1 ${trendUp ? "text-green-500" : "text-red-500"}`}>
            {trendUp ? "↑" : "↓"} {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
