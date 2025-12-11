'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  Calendar,
  MoreVertical,
  UserPlus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  Tag,
  Eye,
  X
} from 'lucide-react'
import { getLeadStatusColor, formatPhone, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { apiGet, apiPost, apiPut, apiDelete, handleApiError, handleApiSuccess } from '@/lib/api'

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
  tag?: string
  notes?: string
  createdAt: string
  updatedAt: string
  lastContact?: string
  activities?: Activity[]
}

interface Activity {
  id: string
  type: string
  description: string
  createdAt: string
  user?: {
    name?: string
  }
}

interface LeadBatch {
  id: string
  name: string
  vendor: string
  cost: number
  size: number
}

export default function CRMPage() {
  const { data: session, status } = useSession()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [showAddLead, setShowAddLead] = useState(false)
  const [showLeadDetails, setShowLeadDetails] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [batches, setBatches] = useState<LeadBatch[]>([])
  const [newLead, setNewLead] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    state: '',
    source: 'MANUAL',
    tag: '',
    notes: '',
    batchId: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchLeads()
      fetchBatches()
    }
  }, [session])

  const fetchLeads = async () => {
    try {
      const data = await apiGet('/api/leads')
      setLeads(data.data || [])
    } catch (error) {
      handleApiError(error, 'Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }

  const fetchBatches = async () => {
    try {
      const data = await apiGet('/api/lead-batches')
      setBatches(data.data || [])
    } catch (error) {
      console.error('Error fetching batches:', error)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter
    
    return matchesSearch && matchesStatus && matchesSource
  })

  const getStatusBadgeVariant = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      NEW: 'default',
      CONTACTED: 'secondary',
      SET: 'outline',
      SAT: 'secondary',
      CLOSED: 'default',
      NO_SHOW: 'destructive',
      DEAD: 'destructive',
      DUPLICATE: 'outline',
    }
    return variants[status] || 'default'
  }

  const handleAddLead = async () => {
    try {
      const leadData = {
        ...newLead,
        age: newLead.age ? parseInt(newLead.age) : undefined
      }
      
      await apiPost('/api/leads', leadData)
      handleApiSuccess('Lead added successfully')
      setShowAddLead(false)
      setNewLead({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        age: '',
        state: '',
        source: 'MANUAL',
        tag: '',
        notes: '',
        batchId: ''
      })
      fetchLeads()
    } catch (error) {
      handleApiError(error, 'Failed to add lead')
    }
  }

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return
    
    try {
      await apiDelete(`/api/leads/${leadId}`)
      handleApiSuccess('Lead deleted successfully')
      fetchLeads()
    } catch (error) {
      handleApiError(error, 'Failed to delete lead')
    }
  }

  const handleViewLeadDetails = (lead: Lead) => {
    setSelectedLead(lead)
    setShowLeadDetails(true)
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-nexus-gold">Loading leads...</div>
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
            <h1 className="text-3xl font-bold text-white">Lead Management</h1>
            <p className="text-gray-400 mt-1">Manage your prospects and pipeline</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/crm/pipeline">
              <Button variant="outline" className="border-nexus-gold text-nexus-gold hover:bg-nexus-gold hover:text-black">
                Pipeline View
              </Button>
            </Link>
            <Button 
              onClick={() => setShowAddLead(true)}
              className="bg-nexus-gold text-black hover:bg-yellow-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search leads by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-32">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                    <SelectItem value="SET">Set</SelectItem>
                    <SelectItem value="SAT">Sat</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="NO_SHOW">No Show</SelectItem>
                    <SelectItem value="DEAD">Dead</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-32">
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="FFL">FFL</SelectItem>
                    <SelectItem value="BRONZE">Bronze</SelectItem>
                    <SelectItem value="THIRD_PARTY">3rd Party</SelectItem>
                    <SelectItem value="NEXUS_NATIVE">Nexus Native</SelectItem>
                    <SelectItem value="REFERRAL">Referral</SelectItem>
                    <SelectItem value="WALK_IN">Walk-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="bg-gray-900 border-gray-800 hover:border-nexus-gold transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-sm">
                        {lead.firstName} {lead.lastName}
                      </CardTitle>
                      <Badge variant={getStatusBadgeVariant(lead.status)} className="text-xs">
                        {lead.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewLeadDetails(lead)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteLead(lead.id)}
                      className="text-gray-400 hover:text-red-400 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <Phone className="h-3 w-3" />
                  <span>{formatPhone(lead.phone)}</span>
                </div>
                
                {lead.email && (
                  <div className="flex items-center space-x-2 text-gray-300 text-sm">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}

                {lead.age && (
                  <div className="flex items-center space-x-2 text-gray-300 text-sm">
                    <Clock className="h-3 w-3" />
                    <span>{lead.age} years old</span>
                  </div>
                )}

                {lead.state && (
                  <div className="flex items-center space-x-2 text-gray-300 text-sm">
                    <MapPin className="h-3 w-3" />
                    <span>{lead.state}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <Tag className="h-3 w-3" />
                  <span>{lead.source}</span>
                </div>

                <div className="pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-400">
                    Added: {formatDate(lead.createdAt)}
                  </p>
                  {lead.lastContact && (
                    <p className="text-xs text-gray-400">
                      Last contact: {formatDate(lead.lastContact)}
                    </p>
                  )}
                </div>

                {lead.notes && (
                  <p className="text-xs text-gray-300 mt-2 line-clamp-2">
                    {lead.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredLeads.length === 0 && (
          <div className="text-center py-12 max-w-md mx-auto">
            <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white">
              {leads.length === 0 ? 'No leads yet' : 'No leads found'}
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              {leads.length === 0 
                ? 'Get started by adding your first lead' 
                : 'Try adjusting your search or filter criteria'}
            </p>
            {leads.length === 0 && (
              <div className="mt-6">
                <Button 
                  onClick={() => setShowAddLead(true)}
                  className="bg-nexus-gold text-black hover:bg-yellow-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Add Lead Modal */}
        {showAddLead && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="bg-gray-900 border-gray-800 w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-white">Add New Lead</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">First Name</label>
                    <Input
                      value={newLead.firstName}
                      onChange={(e) => setNewLead({...newLead, firstName: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Last Name</label>
                    <Input
                      value={newLead.lastName}
                      onChange={(e) => setNewLead({...newLead, lastName: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-sm">Phone</label>
                  <Input
                    value={newLead.phone}
                    onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <Input
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Age</label>
                    <Input
                      value={newLead.age}
                      onChange={(e) => setNewLead({...newLead, age: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                      placeholder="45"
                      type="number"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">State</label>
                    <Input
                      value={newLead.state}
                      onChange={(e) => setNewLead({...newLead, state: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                      placeholder="CA"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-sm">Source</label>
                  <Select 
                    value={newLead.source}
                    onValueChange={(value) => setNewLead({...newLead, source: value})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual Entry</SelectItem>
                      <SelectItem value="FFL">FFL</SelectItem>
                      <SelectItem value="BRONZE">Bronze</SelectItem>
                      <SelectItem value="THIRD_PARTY">3rd Party</SelectItem>
                      <SelectItem value="NEXUS_NATIVE">Nexus Native</SelectItem>
                      <SelectItem value="REFERRAL">Referral</SelectItem>
                      <SelectItem value="WALK_IN">Walk-in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-gray-400 text-sm">Batch (Optional)</label>
                  <Select 
                    value={newLead.batchId}
                    onValueChange={(value) => setNewLead({...newLead, batchId: value})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Batch</SelectItem>
                      {batches.map(batch => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name} - {batch.vendor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-gray-400 text-sm">Tag</label>
                  <Select 
                    value={newLead.tag}
                    onValueChange={(value) => setNewLead({...newLead, tag: value})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                      <SelectValue placeholder="Select tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Tag</SelectItem>
                      <SelectItem value="AGED">Aged</SelectItem>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="INTERNET">Internet</SelectItem>
                      <SelectItem value="LIVE_TRANSFER">Live Transfer</SelectItem>
                      <SelectItem value="WARM">Warm</SelectItem>
                      <SelectItem value="COLD">Cold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-gray-400 text-sm">Notes</label>
                  <textarea
                    value={newLead.notes}
                    onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                    className="w-full mt-1 bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Any additional notes..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={handleAddLead}
                    className="flex-1 bg-nexus-gold text-black hover:bg-yellow-500"
                  >
                    Add Lead
                  </Button>
                  <Button 
                    onClick={() => setShowAddLead(false)}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lead Details Modal */}
        {showLeadDetails && selectedLead && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="bg-gray-900 border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">
                    {selectedLead.firstName} {selectedLead.lastName}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    onClick={() => setShowLeadDetails(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Phone</label>
                    <p className="text-white">{formatPhone(selectedLead.phone)}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Status</label>
                    <Badge variant={getStatusBadgeVariant(selectedLead.status)}>
                      {selectedLead.status}
                    </Badge>
                  </div>
                  {selectedLead.email && (
                    <div>
                      <label className="text-gray-400 text-sm">Email</label>
                      <p className="text-white">{selectedLead.email}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-gray-400 text-sm">Source</label>
                    <p className="text-white">{selectedLead.source}</p>
                  </div>
                  {selectedLead.age && (
                    <div>
                      <label className="text-gray-400 text-sm">Age</label>
                      <p className="text-white">{selectedLead.age}</p>
                    </div>
                  )}
                  {selectedLead.state && (
                    <div>
                      <label className="text-gray-400 text-sm">State</label>
                      <p className="text-white">{selectedLead.state}</p>
                    </div>
                  )}
                  {selectedLead.tag && (
                    <div>
                      <label className="text-gray-400 text-sm">Tag</label>
                      <p className="text-white">{selectedLead.tag}</p>
                    </div>
                  )}
                </div>

                {selectedLead.notes && (
                  <div>
                    <label className="text-gray-400 text-sm">Notes</label>
                    <p className="text-white mt-1">{selectedLead.notes}</p>
                  </div>
                )}

                <div>
                  <label className="text-gray-400 text-sm">Activity History</label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {selectedLead.activities && selectedLead.activities.length > 0 ? (
                      selectedLead.activities.map(activity => (
                        <div key={activity.id} className="p-2 bg-gray-800 rounded text-sm">
                          <p className="text-white">{activity.description}</p>
                          <p className="text-gray-400 text-xs">
                            {formatDate(activity.createdAt)} by {activity.user?.name || 'System'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">No activities yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}