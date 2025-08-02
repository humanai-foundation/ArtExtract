"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, AlertTriangle, Users, Activity, TrendingUp, TrendingDown } from "lucide-react"

export function StatsCards() {
  const stats = [
    {
      title: "Active Cameras",
      value: "4",
      change: "+1",
      changeType: "positive" as const,
      icon: Eye,
      description: "Cameras online",
    },
    {
      title: "Today's Alerts",
      value: "12",
      change: "-3",
      changeType: "positive" as const,
      icon: AlertTriangle,
      description: "Compared to yesterday",
    },
    {
      title: "People Detected",
      value: "47",
      change: "+8",
      changeType: "neutral" as const,
      icon: Users,
      description: "In the last 24h",
    },
    {
      title: "System Uptime",
      value: "99.9%",
      change: "+0.1%",
      changeType: "positive" as const,
      icon: Activity,
      description: "Last 30 days",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="flex items-center">
                {stat.changeType === "positive" ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={stat.changeType === "positive" ? "text-green-500" : "text-red-500"}>
                  {stat.change}
                </span>
              </div>
              <span>{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
