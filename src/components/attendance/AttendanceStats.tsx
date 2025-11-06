import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AttendanceStats as StatsType } from "@/hooks/useAttendance";
import { CheckCircle, XCircle, Calendar, Clock } from "lucide-react";

interface AttendanceStatsProps {
  stats?: StatsType;
  loading?: boolean;
}

export function AttendanceStats({ stats, loading }: AttendanceStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-20" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                মোট দিন
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_days}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                উপস্থিত
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.present_days}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                অনুপস্থিত
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.absent_days}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                ছুটি
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.leave_days}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                বিলম্বে
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.late_days}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">উপস্থিতির শতকরা হার</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-success">
              {stats.attendance_percentage?.toFixed(1)}%
            </span>
            <span className="text-sm text-muted-foreground">
              {stats.present_days + stats.late_days} / {stats.total_days} দিন
            </span>
          </div>
          <Progress 
            value={Number(stats.attendance_percentage) || 0} 
            className="h-3"
          />
        </CardContent>
      </Card>
    </div>
  );
}
