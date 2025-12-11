'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  Target,
  Phone,
  Calendar,
  Eye,
  Settings
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  weeklyAP: number
  monthlyAP: number
  totalApps: number
  status: 'active' | 'inactive' | 'warning'
  lastActivity: string
}

interface TeamStats {
  totalMembers: number
  weeklyAP: number
  monthlyAP: number
  totalApps: number
  activeMembers: number
  driftAlerts: number
}

export default function ManagerDashboardPage() {
  const { data: session, status } = useSession()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalMembers: 0,
    weeklyAP: 0,
    monthlyAP: 0,
    totalApps: 0,
    activeMembers: 0,
    driftAlerts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session && (session.user?.role === 'MANAGER' || session.user?.role === 'AGENCY_OWNER')) {
      fetchTeamData()
    } else if (session) {
      redirect('/dashboard')
    }
  }, [session])

  const fetchTeamData = async () => {
    try {
      const [membersResponse, statsResponse] = await Promise.all([
        fetch('/api/team/members'),
        fetch('/api/team/stats')
      ])

      if (membersResponse.ok && statsResponse.ok) {
        const membersData = await membersResponse.json()
        const statsData = await statsResponse.json()
        
        setTeamMembers(membersData)
        setTeamStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching team data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      active: 'default',
      inactive: 'secondary',
      warning: 'destructive',
    }
    return variants[status] || 'default'
  }

  // Mock chart data
  const performanceData = [
    { week: 'Week 1', ap: 45000, apps: 12 },
    { week: 'Week 2', ap: 52000, apps: 15 },
    { week: 'Week 3', ap: 48000, apps: 13 },
    { week: 'Week 4', ap: 61000, apps: 18 },
  ]

  const memberPerformanceData = teamMembers.slice(0, 5).map(member => ({
    name: member.name.split(' ')[0],
    ap: member.weeklyAP,
    apps: member.totalApps
  }))

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-nexus-gold">Loading team dashboard...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Manager Dashboard</h1>
            <p className="text-gray-400 mt-1">Team performance and oversight</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-nexus-gold text-nexus-gold hover:bg-nexus-gold hover:text-black">
              <Eye className="h-4 w-4 mr-2" />
              Team View
            </Button>
            <Button className="bg-nexus-gold text-black hover:bg-yellow-500">
              <Settings className="h-4 w-4 mr-2" />
              Team Settings
            </Button>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Team Size
              </CardTitle>
              <Users className="h-4 w-4 text-nexus-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {teamStats.totalMembers}
              </div>
              <p className="text-xs text-gray-400">Active agents</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Weekly AP
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(teamStats.weeklyAP)}
              </div>
              <p className="text-xs text-green-400">+12% vs last week</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Monthly AP
              </CardTitle>
              <DollarSign className="h-4 w-4 text-nexus-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(teamStats.monthlyAP)}
              </div>
              <p className="text-xs text-nexus-gold">On track for goal</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Apps
              </CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {teamStats.totalApps}
              </div>
              <p className="text-xs text-blue-400">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Drift Alerts
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {teamStats.driftAlerts}
              </div>
              <p className="text-xs text-red-400">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F3F4F6' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Line type="monotone" dataKey="ap" stroke="#FEC736" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={memberPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F3F4F6' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="ap" fill="#FEC736" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Team Members */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Team Members</CardTitle>
            <p className="text-gray-400 text-sm">Monitor individual performance and activity</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Weekly AP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Monthly AP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Apps
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                            <Users className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {member.name}
                            </div>
                            <div className="text-xs text-gray-400">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(member.status)}>
                          {member.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {formatCurrency(member.weeklyAP)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {formatCurrency(member.monthlyAP)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {member.totalApps}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {member.lastActivity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" className="border-nexus-gold text-nexus-gold hover:bg-nexus-gold hover:text-black">
                            <Phone className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                            <Calendar className="h-3 w-3 mr-1" />
                            Schedule
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Drift Alerts */}
        <Card className="bg-gray-900 border-gray-800 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Drift Alerts</CardTitle>
            <p className="text-gray-400 text-sm">Agents showing concerning patterns</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-900 bg-opacity-20 border border-red-800 rounded-lg">
                <div>
                  <p className="text-red-300 font-medium">John Smith - Low Activity</p>
                  <p className="text-red-100 text-sm">No dials in 3 days, previously averaged 50/day</p>
                </div>
                <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                  Intervene
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-900 bg-opacity-20 border border-yellow-800 rounded-lg">
                <div>
                  <p className="text-yellow-300 font-medium">Sarah Johnson - Production Drop</p>
                  <p className="text-yellow-100 text-sm">Weekly AP down 40% from last month</p>
                </div>
                <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white">
                  Check In
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-900 bg-opacity-20 border border-orange-800 rounded-lg">
                <div>
                  <p className="text-orange-300 font-medium">Mike Davis - Appointment Issues</p>
                  <p className="text-orange-100 text-sm">3 no-shows this week, needs script review</p>
                </div>
                <Button size="sm" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
              Train
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}