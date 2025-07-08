import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardCharts } from "@/components/dashboard-charts"
import { DashboardStats } from "@/components/dashboard-stats"
import { PersonnelUsageChart } from "@/components/personnel-usage-chart"
import Link from "next/link"

export default function Dashboard() {
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-4 w-full">
      <div className="lg:col-span-3">
        <Card className="w-full h-full flex flex-col">
          <Link href="/dashboard/rack-management" className="block">
            <CardHeader className="cursor-pointer hover:bg-accent/10 rounded-t-lg">
              <CardTitle>Rack Usage Overview</CardTitle>
            </CardHeader>
          </Link>
          <CardContent className="flex-1">
            <DashboardCharts />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        <DashboardStats />
      </div>

      {/* 添加人員使用量折線圖 */}
      <div className="lg:col-span-4 mt-2">
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle>Personnel Usage Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonnelUsageChart />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
