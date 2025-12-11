'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Phone, 
  PhoneOff, 
  User, 
  Mail, 
  Calendar, 
  Clock,
  Check,
  X,
  MessageSquare,
  SkipForward,
  AlertCircle
} from 'lucide-react'
import { formatPhone } from '@/lib/utils'

interface Lead {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  age?: number
  state?: string
  status: string
  source: string
  notes?: string
}

interface CallResult {
  disposition: string
  notes: string
  callbackDate?: string
  appointmentDate?: string
}

export default function DialSessionPage() {
  const { data: session, status } = useSession()
  const [leads, setLeads] = useState<Lead[]>([])
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0)
  const [sessionActive, setSessionActive] = useState(false)
  const [callStartTime, setCallStartTime] = useState<Date | null>(null)
  const [callDuration, setCallDuration] = useState(0)
  const [callResult, setCallResult] = useState<CallResult>({
    disposition: '',
    notes: '',
    callbackDate: '',
    appointmentDate: ''
  })
  const [showResultModal, setShowResultModal] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    dials: 0,
    contacts: 0,
    appointments: 0,
    sales: 0
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session && !sessionActive) {
      fetchLeadsForDialing()
    }
  }, [session])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (callStartTime) {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime.getTime()) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [callStartTime])

  const fetchLeadsForDialing = async () => {
    try {
      const response = await fetch('/api/leads/dial-ready')
      if (response.ok) {
        const data = await response.json()
        setLeads(data)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    }
  }

  const startSession = () => {
    setSessionActive(true)
    if (leads.length > 0) {
      startCall(leads[currentLeadIndex])
    }
  }

  const startCall = (lead: Lead) => {
    setCallStartTime(new Date())
    setCallDuration(0)
    // In a real implementation, this would trigger the actual phone call
    console.log(`Starting call to ${lead.firstName} ${lead.lastName} at ${lead.phone}`)
  }

  const endCall = () => {
    setCallStartTime(null)
    setCallDuration(0)
    setShowResultModal(true)
  }

  const submitCallResult = async () => {
    if (!callResult.disposition) return

    try {
      const currentLead = leads[currentLeadIndex]
      
      // Update lead status
      const response = await fetch(`/api/leads/${currentLead.id}/disposition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          disposition: callResult.disposition,
          notes: callResult.notes,
          callbackDate: callResult.callbackDate,
          appointmentDate: callResult.appointmentDate
        }),
      })

      if (response.ok) {
        // Update session stats
        setSessionStats(prev => ({
          ...prev,
          dials: prev.dials + 1,
          contacts: prev.contacts + (callResult.disposition !== 'NO_ANSWER' ? 1 : 0),
          appointments: prev.appointments + (callResult.disposition === 'SET' ? 1 : 0),
          sales: prev.sales + (callResult.disposition === 'SALE' ? 1 : 0)
        }))

        // Move to next lead
        if (currentLeadIndex < leads.length - 1) {
          setCurrentLeadIndex(currentLeadIndex + 1)
          setCallResult({ disposition: '', notes: '', callbackDate: '', appointmentDate: '' })
          setShowResultModal(false)
          startCall(leads[currentLeadIndex + 1])
        } else {
          // Session complete
          setSessionActive(false)
          setShowResultModal(false)
          setCurrentLeadIndex(0)
        }
      }
    } catch (error) {
      console.error('Error submitting call result:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentLead = leads[currentLeadIndex]

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-nexus-gold">Loading dial session...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!sessionActive) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Session Setup */}
            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Dial Session Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-nexus-gold mb-2">
                      {leads.length}
                    </div>
                    <p className="text-gray-400">Leads Ready</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {sessionStats.dials}
                    </div>
                    <p className="text-gray-400">Dials Today</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {sessionStats.appointments}
                    </div>
                    <p className="text-gray-400">Appointments Set</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button 
                    onClick={startSession}
                    className="bg-nexus-gold text-black hover:bg-yellow-500 text-lg px-8 py-4"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Start Dial Session
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Today's Performance */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Today's Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-white mb-1">
                      {sessionStats.dials}
                    </div>
                    <p className="text-gray-400 text-sm">Total Dials</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {sessionStats.contacts}
                    </div>
                    <p className="text-gray-400 text-sm">Contacts</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                      {sessionStats.appointments}
                    </div>
                    <p className="text-gray-400 text-sm">Appointments</p>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-nexus-gold mb-1">
                      {sessionStats.sales}
                    </div>
                    <p className="text-gray-400 text-sm">Sales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Session Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Dial Session</h1>
              <p className="text-gray-400 mt-1">
                Lead {currentLeadIndex + 1} of {leads.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-nexus-gold">
                  {formatDuration(callDuration)}
                </div>
                <p className="text-gray-400 text-sm">Call Duration</p>
              </div>
              <Button 
                onClick={endCall}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                End Call
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Lead Info */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Current Lead</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentLead ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {currentLead.firstName} {currentLead.lastName}
                          </h3>
                          <div className="flex items-center space-x-2 text-gray-400">
                            <span>{currentLead.age || 'N/A'} years old</span>
                            <span>•</span>
                            <span>{currentLead.state || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-300">Phone</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-white">
                              {formatPhone(currentLead.phone)}
                            </span>
                          </div>
                        </div>
                        
                        {currentLead.email && (
                          <div>
                            <Label className="text-gray-300">Email</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-white">{currentLead.email}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label className="text-gray-300">Lead Source</Label>
                        <div className="mt-1">
                          <Badge variant="secondary">{currentLead.source}</Badge>
                        </div>
                      </div>

                      {currentLead.notes && (
                        <div>
                          <Label className="text-gray-300">Notes</Label>
                          <p className="text-gray-300 mt-1">{currentLead.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-white">No leads available</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        Please check back later or add more leads to your pipeline.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gray-900 border-gray-800 mt-6">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="border-nexus-gold text-nexus-gold hover:bg-nexus-gold hover:text-black">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send SMS
                    </Button>
                    <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white">
                      <Calendar className="h-4 w-4 mr-2" />
                      Set Appointment
                    </Button>
                    <Button variant="outline" className="border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white">
                      <SkipForward className="h-4 w-4 mr-2" />
                      Skip Lead
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Session Stats & AI Insights */}
            <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Session Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Dials</span>
                      <span className="text-white font-bold">{sessionStats.dials}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Contacts</span>
                      <span className="text-green-400 font-bold">{sessionStats.contacts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Appointments</span>
                      <span className="text-blue-400 font-bold">{sessionStats.appointments}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Contact Rate</span>
                      <span className="text-nexus-gold font-bold">
                        {sessionStats.dials > 0 ? Math.round((sessionStats.contacts / sessionStats.dials) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">AI Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg">
                      <p className="text-blue-300 text-sm font-medium">Script Tip</p>
                      <p className="text-white text-sm">Try asking about their current coverage first.</p>
                    </div>
                    <div className="p-3 bg-green-900 bg-opacity-20 border border-green-800 rounded-lg">
                      <p className="text-green-300 text-sm font-medium">Timing</p>
                      <p className="text-white text-sm">Great time to call - high answer rate.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Call Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="bg-gray-900 border-gray-800 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-white">Call Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">Disposition</Label>
                <select
                  value={callResult.disposition}
                  onChange={(e) => setCallResult({ ...callResult, disposition: e.target.value })}
                  className="w-full mt-1 bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                >
                  <option value="">Select result...</option>
                  <option value="NO_ANSWER">No Answer</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                  <option value="CALLBACK">Call Back</option>
                  <option value="SET">Appointment Set</option>
                  <option value="SAT">Appointment Sat</option>
                  <option value="SALE">Sale Made</option>
                  <option value="DEAD">Dead Lead</option>
                </select>
              </div>

              {callResult.disposition === 'CALLBACK' && (
                <div>
                  <Label className="text-gray-300">Callback Date</Label>
                  <Input
                    type="datetime-local"
                    value={callResult.callbackDate}
                    onChange={(e) => setCallResult({ ...callResult, callbackDate: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                  />
                </div>
              )}

              {callResult.disposition === 'SET' && (
                <div>
                  <Label className="text-gray-300">Appointment Date</Label>
                  <Input
                    type="datetime-local"
                    value={callResult.appointmentDate}
                    onChange={(e) => setCallResult({ ...callResult, appointmentDate: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                  />
                </div>
              )}

              <div>
                <Label className="text-gray-300">Notes</Label>
                <Textarea
                  value={callResult.notes}
                  onChange={(e) => setCallResult({ ...callResult, notes: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                  rows={3}
                  placeholder="Add notes about the conversation..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={submitCallResult}
                  className="flex-1 bg-nexus-gold text-black hover:bg-yellow-500"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Submit Result
                </Button>
                <Button 
                  onClick={() => setShowResultModal(false)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}