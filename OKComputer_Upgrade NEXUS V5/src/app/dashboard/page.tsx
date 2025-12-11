'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  Phone,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface DailyMetrics {
  dials: number
  contacts: number
  appointmentsSet: number
  appointmentsSat: number
  applications: number
  weeklyGoal: number
  monthlyGoal: number
}

interface PerformanceStats {
  weeklyAP: number
  monthlyAP: number
  totalLeads: number
  contactedLeads: number
  setAppointments: number
  closedDeals: number
  conversionRate: number
}

interface Goal {
  id: string
  type: 'dials' | 'appointments' | 'applications' | 'savings'
  target: number
  current: number
  deadline: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [metrics, setMetrics] = useState<DailyMetrics>({
    dials: 0,
    contacts: 0,
    appointmentsSet: 0,
    appointmentsSat: 0,
    applications: 0,
    weeklyGoal: 100,
    monthlyGoal: 400
  })
  const [stats, setStats] = useState<PerformanceStats>({
    weeklyAP: 12500,
    monthlyAP: 48500,
    totalLeads: 234,
    contactedLeads: 156,
    setAppointments: 42,
    closedDeals: 18,
    conversionRate: 7.7
  })
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      // Fetch daily metrics
      const metricsResponse = await fetch('/api/dashboard/metrics')
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData)
      }

      // Fetch performance stats
      const statsResponse = await fetch('/api/dashboard/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch goals
      const goalsResponse = await fetch('/api/goals')
      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json()
        setGoals(goalsData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressPercentage = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100)
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-nexus-gold">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {session?.user?.name || 'Agent'}
          </h1>
          <p className="text-gray-400">
            Here's your performance overview for today
          </p>
        </div>

        {/* Daily Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Dials Today
              </CardTitle>
              <Phone className="h-4 w-4 text-nexus-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metrics.dials}
              </div>
              <p className="text-xs text-gray-400">Goal: {metrics.weeklyGoal}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Contacts
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metrics.contacts}
              </div>
              <p className="text-xs text-blue-400">
                {metrics.dials > 0 ? Math.round((metrics.contacts / metrics.dials) * 100) : 0}% contact rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Appointments Set
              </CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metrics.appointmentsSet}
              </div>
              <p className="text-xs text-green-400">
                {metrics.contacts > 0 ? Math.round((metrics.appointmentsSet / metrics.contacts) * 100) : 0}% set rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Applications
              </CardTitle>
              <FileText className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metrics.applications}
              </div>
              <p className="text-xs text-purple-400">
                {metrics.appointmentsSat > 0 ? Math.round((metrics.applications / metrics.appointmentsSat) * 100) : 0}% close rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Weekly AP
              </CardTitle>
              <DollarSign className="h-4 w-4 text-nexus-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(stats.weeklyAP)}
              </div>
              <p className="text-xs text-nexus-gold">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Goals Progress */}
        {goals.length > 0 && (
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Daily Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 capitalize">
                      {goal.type.replace('_', ' ')}
                    </span>
                    <span className="text-white text-sm">
                      {goal.current} / {goal.target}
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(goal.current, goal.target)} 
                    className={cn("h-2", getProgressColor(getProgressPercentage(goal.current, goal.target)))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/dial">
            <Button className="w-full h-24 bg-gray-900 border border-gray-800 hover:border-nexus-gold hover:bg-gray-800 transition-all">
              <div className="flex flex-col items-center space-y-2">
                <Phone className="h-6 w-6 text-nexus-gold" />
                <span className="text-white font-medium">Start Dial Session</span>
                <span className="text-gray-400 text-sm">Begin prospecting</span>
              </div>
            </Button>
          </Link>

          <Link href="/crm">
            <Button className="w-full h-24 bg-gray-900 border border-gray-800 hover:border-nexus-gold hover:bg-gray-800 transition-all">
              <div className="flex flex-col items-center space-y-2">
                <Users className="h-6 w-6 text-nexus-gold" />
                <span className="text-white font-medium">Manage Pipeline</span>
                <span className="text-gray-400 text-sm">{stats.totalLeads} active leads</span>
              </div>
            </Button>
          </Link>

          <Link href="/finance">
            <Button className="w-full h-24 bg-gray-900 border border-gray-800 hover:border-nexus-gold hover:bg-gray-800 transition-all">
              <div className="flex flex-col items-center space-y-2">
                <DollarSign className="h-6 w-6 text-nexus-gold" />
                <span className="text-white font-medium">View Finances</span>
                <span className="text-gray-400 text-sm">Track your money</span>
              </div>
            </Button>
          </Link>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Performance Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-xl font-bold text-white">
                    {stats.totalLeads}
                  </div>
                  <p className="text-gray-400 text-sm">Total Leads</p>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-xl font-bold text-white">
                    {stats.contactedLeads}
                  </div>
                  <p className="text-gray-400 text-sm">Contacted</p>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-xl font-bold text-white">
                    {stats.setAppointments}
                  </div>
                  <p className="text-gray-400 text-sm">Appointments Set</p>
                </div>
                <div className="text-center p-3 bg-gray-800 rounded-lg">
                  <div className="text-xl font-bold text-white">
                    {stats.closedDeals}
                  </div>
                  <p className="text-gray-400 text-sm">Closed Deals</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-nexus-gold bg-opacity-10 border border-nexus-gold rounded-lg">
                <div>
                  <p className="text-nexus-gold text-sm font-medium">Conversion Rate</p>
                  <p className="text-white text-sm">Lead to Sale</p>
                </div>
                <div className="text-nexus-gold text-xl font-bold">
                  {stats.conversionRate}%
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Closed deal with John Smith</p>
                  <p className="text-gray-400 text-xs">2 hours ago • $2,500 AP</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Set appointment with Sarah Johnson</p>
                  <p className="text-gray-400 text-xs">4 hours ago • Tomorrow 2:00 PM</p>
                </div>
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Contacted lead from Batch #234</p>
                  <p className="text-gray-400 text-xs">6 hours ago • Interested</p>
                </div>
                <Phone className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">New lead assigned</p>
                  <p className="text-gray-400 text-xs">8 hours ago • Warm transfer</p>
                </div>
                <Users className="h-4 w-4 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="bg-gray-900 border-gray-800 mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">AI Insights</CardTitle>
            <Zap className="h-5 w-5 text-nexus-gold" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg">
              <p className="text-blue-300 text-sm font-medium mb-1">Performance Trend</p>
              <p className="text-white text-sm">Your dial volume is up 15% this week. Keep the momentum going!</p>
            </div>
            <div className="p-4 bg-green-900 bg-opacity-20 border border-green-800 rounded-lg">
              <p className="text-green-300 text-sm font-medium mb-1">Lead Quality</p>
              <p className="text-white text-sm">Your recent batch shows 23% higher conversion rate than average.</p>
            </div>
            <div className="p-4 bg-yellow-900 bg-opacity-20 border border-yellow-800 rounded-lg">
              <p className="text-yellow-300 text-sm font-medium mb-1">Appointment Tip</p>
              <p className="text-white text-sm">Try scheduling appointments within 48 hours of first contact for better show rates.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}