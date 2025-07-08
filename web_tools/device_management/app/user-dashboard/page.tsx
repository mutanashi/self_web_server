import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserDashboardStats } from "@/components/user-dashboard-stats"
import { UserDashboardCharts } from "@/components/user-dashboard-charts"
import { UserServiceStatus } from "@/components/user-service-status"
import { PersonnelUsageChart } from "@/components/personnel-usage-chart"
import Link from "next/link"

export default function UserDashboard() {
  return (
    <div className="space-y-6 w-full">
      <h1 className="text-2xl font-bold text-foreground">User Dashboard</h1>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 w-full">
        <div className="lg:col-span-2">
          <Card className="w-full h-full">
            <Link href="/user-dashboard/services" className="block">
              <CardHeader className="cursor-pointer hover:bg-accent/10 rounded-t-lg">
                <CardTitle>Service Status Overview</CardTitle>
              </CardHeader>
            </Link>
            <CardContent>
              <UserServiceStatus />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <UserDashboardStats />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 w-full">
        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <UserDashboardCharts />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium">Web Server 1 is online</p>
                  <p className="text-xs text-muted-foreground">Today 09:15</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-medium">IP address 192.168.1.50 has been assigned</p>
                  <p className="text-xs text-muted-foreground">Yesterday 14:30</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <div>
                  <p className="text-sm font-medium">Database service entered maintenance mode</p>
                  <p className="text-xs text-muted-foreground">Yesterday 10:45</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <div>
                  <p className="text-sm font-medium">New backup server added</p>
                  <p className="text-xs text-muted-foreground">2023/05/20</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 添加人員使用量折線圖 */}
      <Card>
        <CardHeader>
          <CardTitle>Personnel Usage Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonnelUsageChart />
        </CardContent>
      </Card>
    </div>
  )
}
