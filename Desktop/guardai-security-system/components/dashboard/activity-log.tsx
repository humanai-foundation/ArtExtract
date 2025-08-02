"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Download, Eye, Mic, Users, AlertTriangle } from "lucide-react"

interface LogEntry {
  id: string
  timestamp: Date
  type: "entry" | "exit" | "alert" | "detection"
  category: "vision" | "audio" | "face" | "motion"
  description: string
  location: string
  severity: "low" | "medium" | "high"
}

export function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    // Generate sample log data
    const sampleLogs: LogEntry[] = [
      {
        id: "1",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        type: "detection",
        category: "vision",
        description: "Person detected entering Zone A",
        location: "Main Entrance",
        severity: "medium",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        type: "alert",
        category: "audio",
        description: "Unusual sound pattern detected",
        location: "Storage Room",
        severity: "high",
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        type: "entry",
        category: "face",
        description: "Authorized personnel - John Smith",
        location: "Main Entrance",
        severity: "low",
      },
      {
        id: "4",
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        type: "detection",
        category: "motion",
        description: "Motion detected in restricted area",
        location: "Server Room",
        severity: "high",
      },
      {
        id: "5",
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        type: "exit",
        category: "face",
        description: "Employee departure - Jane Doe",
        location: "Side Exit",
        severity: "low",
      },
    ]
    setLogs(sampleLogs)
    setFilteredLogs(sampleLogs)
  }, [])

  useEffect(() => {
    const filtered = logs.filter(
      (log) =>
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.location.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredLogs(filtered)
  }, [searchTerm, logs])

  const getCategoryIcon = (category: LogEntry["category"]) => {
    switch (category) {
      case "vision":
        return <Eye className="h-4 w-4" />
      case "audio":
        return <Mic className="h-4 w-4" />
      case "face":
        return <Users className="h-4 w-4" />
      case "motion":
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: LogEntry["severity"]) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
    }
  }

  const getTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "alert":
        return "destructive"
      case "detection":
        return "default"
      case "entry":
        return "secondary"
      case "exit":
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Log</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search activity logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{log.timestamp.toLocaleTimeString()}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeColor(log.type)}>{log.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(log.category)}
                      <span className="capitalize">{log.category}</span>
                    </div>
                  </TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{log.location}</TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(log.severity)}>{log.severity}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
