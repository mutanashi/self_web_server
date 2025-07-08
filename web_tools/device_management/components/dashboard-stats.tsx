import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Server, Wifi } from "lucide-react"

export function DashboardStats() {
  const stats = [
    {
      title: "IP Addresses",
      icon: Globe,
      total: "1024",
      used: "768",
      available: "256",
      color: "text-blue-500",
      bgColor: "bg-blue-500",
      href: "/dashboard/ip-management",
    },
    {
      title: "Devices",
      icon: Server,
      total: "256",
      used: "198",
      available: "58",
      color: "text-green-500",
      bgColor: "bg-green-500",
      href: "/dashboard/device-management",
    },
    {
      title: "Network",
      icon: Wifi,
      total: "48",
      used: "32",
      available: "16",
      color: "text-purple-500",
      bgColor: "bg-purple-500",
      href: "/dashboard/search",
    },
  ]

  return (
    <>
      {stats.map((stat) => (
        <Link key={stat.title} href={stat.href} className="block transition-transform hover:scale-[1.02]">
          <Card className="cursor-pointer hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.used}/{stat.total}
              </div>
              <p className="text-xs text-muted-foreground">{stat.available} available</p>
              <div className="mt-4 h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full ${stat.bgColor}`}
                  style={{ width: `${(Number.parseInt(stat.used) / Number.parseInt(stat.total)) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </>
  )
}
