'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Video,
  FileText,
  Award
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface RecruitData {
  id: string
  status: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  dateOfBirth?: string
  submittedAt?: string
  approvedAt?: string
}

export default function RecruitPortalPage() {
  const { data: session, status } = useSession()
  const [recruitData, setRecruitData] = useState<RecruitData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchRecruitData()
    }
  }, [session])

  const fetchRecruitData = async () => {
    try {
      const response = await fetch('/api/recruits/profile')
      if (response.ok) {
        const data = await response.json()
        setRecruitData(data)
      }
    } catch (error) {
      console.error('Error fetching recruit data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      NEW: 'default',
      SUBMITTED_TO_TYLICA: 'outline',
      AWAITING_FFL_EMAILS: 'secondary',
      LICENSED: 'outline',
      ACTIVATED: 'default',
    }
    return variants[status] || 'default'
  }

  const getStatusDisplayName = (status: string) => {
    const displayNames: { [key: string]: string } = {
      NEW: 'New Application',
      SUBMITTED_TO_TYLICA: 'Submitted to Wolfpack',
      AWAITING_FFL_EMAILS: 'Awaiting FFL Emails',
      LICENSED: 'Licensed',
      ACTIVATED: 'Activated Agent',
    }
    return displayNames[status] || status
  }

  const getProgressPercentage = (status: string) => {
    const progress: { [key: string]: number } = {
      NEW: 20,
      SUBMITTED_TO_TYLICA: 40,
      AWAITING_FFL_EMAILS: 60,
      LICENSED: 80,
      ACTIVATED: 100,
    }
    return progress[status] || 0
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-nexus-dark flex items-center justify-center">
        <div className="text-nexus-gold">Loading recruit portal...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nexus-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-nexus-gold rounded-lg flex items-center justify-center">
              <User className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-4xl font-bold text-nexus-gold">Recruit Portal</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Your journey to becoming a licensed agent starts here
          </p>
        </div>

        {/* Status Overview */}
        <Card className="bg-gray-900 border-gray-800 mb-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white">Application Status</CardTitle>
            <CardDescription className="text-gray-400">
              Track your progress through the licensing process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {getStatusDisplayName(recruitData?.status || 'NEW')}
                  </h3>
                  <p className="text-gray-400">
                    {recruitData?.status === 'NEW' && 'Complete your application to get started'}
                    {recruitData?.status === 'SUBMITTED_TO_TYLICA' && 'Your application has been submitted to Wolfpack for review'}
                    {recruitData?.status === 'AWAITING_FFL_EMAILS' && 'Waiting for FFL onboarding emails'}
                    {recruitData?.status === 'LICENSED' && 'Congratulations! You are now licensed'}
                    {recruitData?.status === 'ACTIVATED' && 'You are now an activated agent'}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(recruitData?.status || 'NEW')} className="text-lg px-4 py-2">
                  {recruitData?.status}
                </Badge>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{getProgressPercentage(recruitData?.status || 'NEW')}%</span>
                </div>
                <Progress value={getProgressPercentage(recruitData?.status || 'NEW')} className="h-3" />
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    recruitData?.status !== 'NEW' ? 'bg-green-500' : 'bg-gray-600'
                  }`}>
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Application Submitted</p>
                    <p className="text-gray-400 text-sm">Your information has been collected</p>
                  </div>
                  {recruitData?.submittedAt && (
                    <span className="text-gray-400 text-sm">
                      {formatDate(recruitData.submittedAt)}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ['AWAITING_FFL_EMAILS', 'LICENSED', 'ACTIVATED'].includes(recruitData?.status || '') ? 'bg-green-500' : 'bg-gray-600'
                  }`}>
                    {['AWAITING_FFL_EMAILS', 'LICENSED', 'ACTIVATED'].includes(recruitData?.status || '') ? (
                      <CheckCircle className="h-5 w-5 text-white" />
                    ) : (
                      <Clock className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Wolfpack Review</p>
                    <p className="text-gray-400 text-sm">Application under review by Wolfpack admin</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ['LICENSED', 'ACTIVATED'].includes(recruitData?.status || '') ? 'bg-green-500' : 'bg-gray-600'
                  }`}>
                    {['LICENSED', 'ACTIVATED'].includes(recruitData?.status || '') ? (
                      <CheckCircle className="h-5 w-5 text-white" />
                    ) : (
                      <Clock className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">FFL Licensing</p>
                    <p className="text-gray-400 text-sm">Complete FFL onboarding and licensing</p>
                  </div>
                  {recruitData?.approvedAt && (
                    <span className="text-gray-400 text-sm">
                      {formatDate(recruitData.approvedAt)}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    recruitData?.status === 'ACTIVATED' ? 'bg-green-500' : 'bg-gray-600'
                  }`}>
                    {recruitData?.status === 'ACTIVATED' ? (
                      <CheckCircle className="h-5 w-5 text-white" />
                    ) : (
                      <Clock className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Agent Activation</p>
                    <p className="text-gray-400 text-sm">Full access to NEXUS OS granted</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        {recruitData?.status === 'NEW' && (
          <Card className="bg-gray-900 border-gray-800 mb-8 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white">Complete Your Application</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-nexus-gold" />
                    <span className="text-white">Personal Information</span>
                  </div>
                  <Button size="sm" className="bg-nexus-gold text-black hover:bg-yellow-500">
                    Complete
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-nexus-gold" />
                    <span className="text-white">Contact Details</span>
                  </div>
                  <Button size="sm" className="bg-nexus-gold text-black hover:bg-yellow-500">
                    Complete
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-nexus-gold" />
                    <span className="text-white">Application Form</span>
                  </div>
                  <Button size="sm" className="bg-nexus-gold text-black hover:bg-yellow-500">
                    Complete
                  </Button>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Button className="bg-green-600 text-white hover:bg-green-700">
                  Submit Application
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Training Resources */}
        {recruitData?.status !== 'NEW' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Pre-License Training</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Complete your required pre-license education and prepare for the state exam.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full border-nexus-gold text-nexus-gold hover:bg-nexus-gold hover:text-black">
                    Start Course
                  </Button>
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                    Practice Exam
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Video className="h-5 w-5" />
                  <span>Video Training</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Watch training videos from top producers and learn proven sales techniques.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full border-nexus-gold text-nexus-gold hover:bg-nexus-gold hover:text-black">
                    Browse Videos
                  </Button>
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                    Live Webinars
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Success Message */}
        {recruitData?.status === 'ACTIVATED' && (
          <Card className="bg-green-900 border-green-800 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Award className="h-6 w-6" />
                <span>Welcome to NEXUS!</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-100 mb-4">
                Congratulations! You are now a licensed agent with full access to the NEXUS operating system. 
                You can now access the Agent Dashboard and begin your journey as a life insurance professional.
              </p>
              <Button className="bg-nexus-gold text-black hover:bg-yellow-500">
                Go to Agent Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Support */}
        <Card className="bg-gray-900 border-gray-800 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              Have questions about the process or need assistance with your application?
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" className="border-nexus-gold text-nexus-gold hover:bg-nexus-gold hover:text-black">
                Contact Support
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                FAQ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}