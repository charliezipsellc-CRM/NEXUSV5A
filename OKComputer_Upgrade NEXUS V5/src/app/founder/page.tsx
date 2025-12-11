'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Zap,
  TrendingUp, 
  DollarSign, 
  Users,
  Building,
  AlertCircle,
  Target,
  Award,
  Settings,
  Eye
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface Agency {
  id: string
  name: string
  totalAgents: number
  weeklyAP: number
  monthlyAP: number
  status: 'active' | 'inactive' | 'warning'
}

interface FounderStats {
  totalAgencies: number
  totalAgents: number
  totalWeeklyAP: number
  totalMonthlyAP: number
  activeRecruits: number
  driftAlerts: number
}

export default function FounderDashboardPage() {
  const { data: session, status } = useSession()
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [stats, setStats] = useState<FounderStats>({
    totalAgencies: 0,
    totalAgents: 0,
    totalWeeklyAP: 0,
    totalMonthlyAP: 0,
    activeRecruits: 0,
    driftAlerts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session && (session.user?.role === 'FOUNDER' || session.user?.role === 'PLATFORM_OWNER')) {
      fetchFounderData()
    } else if (session) {
      redirect('/dashboard')
    }
  }, [session])

  const fetchFounderData = async () => {
    try {
      const [agenciesResponse, statsResponse] = await Promise.all([
        fetch('/api/founder/agencies'),
        fetch('/api/founder/stats')
      ])

      if (agenciesResponse.ok && statsResponse.ok) {
        const agenciesData = await agenciesResponse.json()
        const statsData = await statsResponse.json()
        
        setAgencies(agenciesData)
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching founder data:', error)
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
  const empireGrowthData = [
    { month: 'Jan', agencies: 3, agents: 45, ap: 180000 },
    { month: 'Feb', agencies: 4, agents: 62, ap: 245000 },
    { month: 'Mar', agencies: 5, agents: 78, ap: 320000 },
    { month: 'Apr', agencies: 6, agents: 95, ap: 410000 },
    { month: 'May', agencies: 7, agents: 118, ap: 525000 },
    { month: 'Jun', agencies: stats.totalAgencies, agents: stats.totalAgents, ap: stats.totalMonthlyAP },
  ]

  const agencyBreakdownData = agencies.map(agency => ({
    name: agency.name,
    agents: agency.totalAgents,
    ap: agency.monthlyAP
  }))

  const COLORS = ['#FEC736', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444']

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-nexus-gold">Loading founder dashboard...</div>
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
            <h1 className="text-3xl font-bold text-white">Founder Dashboard</h1>
            <p className="text-gray-400 mt-1">Empire-wide analytics and controls</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-nexus-gold text-nexus-gold hover:bg-nexus-gold hover:text-black">
              <Eye className="h-4 w-4 mr-2" />
              System Overview
            </Button>
            <Button className="bg-nexus-gold text-black hover:bg-yellow-500">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
          </div>
        </div>

        {/* Empire Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Agencies
              </CardTitle>
              <Building className="h-4 w-4 text-nexus-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.totalAgencies}
              </div>
              <p className="text-xs text-gray-400">Active units</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Agents
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.totalAgents}
              </div>
              <p className="text-xs text-blue-400">Licensed agents</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Empire AP
              </CardTitle>
              <Zap className="h-4 w-4 text-nexus-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(stats.totalWeeklyAP)}
              </div>
              <p className="text-xs text-nexus-gold">This week</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Monthly AP
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(stats.totalMonthlyAP)}
              </div>
              <p className="text-xs text-green-400">+28% growth</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Recruits
              </CardTitle>
              <Award className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.activeRecruits}
              </div>
              <p className="text-xs text-purple-400">In pipeline</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Alerts
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.driftAlerts}
              </div>
              <p className="text-xs text-red-400">System-wide</p>
            </CardContent>
          </Card>
        </div>

        {/* Empire Growth Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Empire Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={empireGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Line type="monotone" dataKey="agencies" stroke="#FEC736" strokeWidth={2} name="Agencies" />
                  <Line type="monotone" dataKey="agents" stroke="#10B981" strokeWidth={2} name="Agents" />
                  <Line type="monotone" dataKey="ap" stroke="#3B82F6" strokeWidth={2} name="Monthly AP" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Agency Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={agencyBreakdownData}>
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

        {/* Agency Overview */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Agency Overview</CardTitle>
            <p className="text-gray-400 text-sm">Performance across all agencies</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Agency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Agents
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Weekly AP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Monthly AP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {agencies.map((agency) => (
                    <tr key={agency.id} className="hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                            <Building className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {agency.name}
                            </div>
                            <div className="text-xs text-gray-400">Life Insurance Division</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(agency.status)}>
                          {agency.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {agency.totalAgents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {formatCurrency(agency.weeklyAP)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {formatCurrency(agency.monthlyAP)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" className="border-nexus-gold text-nexus-gold hover:bg-nexus-gold hover:text-black">
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                            Manage
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

        {/* System Health & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-900 bg-opacity-20 border border-green-800 rounded-lg">
                  <div>
                    <p className="text-green-300 font-medium">API Performance</p>
                    <p className="text-green-100 text-sm">99.9% uptime this month</p>
                  </div>
                  <div className="text-green-400 text-2xl font-bold">99.9%</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg">
                  <div>
                    <p className="text-blue-300 font-medium">Database</p>
                    <p className="text-blue-100 text-sm">All systems operational</p>
                  </div>
                  <div className="text-blue-400 text-2xl font-bold">✓</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-900 bg-opacity-20 border border-yellow-800 rounded-lg">
                  <div>
                    <p className="text-yellow-300 font-medium">AI Services</p>
                    <p className="text-yellow-100 text-sm">OpenAI API responding normally</p>
                  </div>
                  <div className="text-yellow-400 text-2xl font-bold">✓</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-900 bg-opacity-20 border border-purple-800 rounded-lg">
                  <div>
                    <p className="text-purple-300 font-medium">SMS Gateway</p>
                    <p className="text-purple-100 text-sm">Twilio services active</p>
                  </div>
                  <div className="text-purple-400 text-2xl font-bold">✓</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">System Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full bg-nexus-gold text-black hover:bg-yellow-500 justify-start">
                  <Users className="h-4 w-4 mr-3" />
                  Manage Agencies
                </Button>
                
                <Button className="w-full bg-gray-800 text-white hover:bg-gray-700 justify-start">
                  <Settings className="h-4 w-4 mr-3" />
                  System Configuration
                </Button>
                
                <Button className="w-full bg-gray-800 text-white hover:bg-gray-700 justify-start">
                  <AlertCircle className="h-4 w-4 mr-3" />
                  Alert Thresholds
                </Button>
                
                <Button className="w-full bg-gray-800 text-white hover:bg-gray-700 justify-start">
                  <Award className="h-4 w-4 mr-3" />
                  Commission Settings
                </Button>
                
                <Button className="w-full bg-gray-800 text-white hover:bg-gray-700 justify-start">
                  <Building className="h-4 w-4 mr-3" />
                  Agency Templates
                </Button>
                
                <Button className="w-full bg-gray-800 text-white hover:bg-gray-700 justify-start">
                  <Zap className="h-4 w-4 mr-3" />
                  Integration Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}