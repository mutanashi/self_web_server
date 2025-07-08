import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Server, Wifi } from "lucide-react"

export function UserDashboardStats() {
  const stats = [
    {
      title: "Available Services",
      icon: Wifi,
      value: "3/3",
      status: "All Normal",
      color: "text-green-500",
      bgColor: "bg-green-500",
      href: "/user-dashboard/services",
    },
    {
      title: "My Devices",
      icon: Server,
      value: "5",
      status: "Assigned",
      color: "text-blue-500",
      bgColor: "bg-blue-500",
      href: "/user-dashboard/devices",
    },
    {
      title: "My IP Addresses",
      icon: Globe,
      value: "8",
      status: "Assigned",
      color: "text-purple-500",
      bgColor: "bg-purple-500",
      href: "/user-dashboard/ip-lookup",
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
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.status}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </>
  )
}
