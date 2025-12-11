'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  FileText,
  DollarSign,
  Calendar,
  Eye,
  Plus
} from 'lucide-react'
import { formatPhone, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  policies: Policy[]
  totalPremium: number
  status: 'active' | 'inactive'
  createdAt: string
}

interface Policy {
  id: string
  carrier: string
  productType: string
  faceAmount?: number
  premium: number
  status: string
  issueDate?: string
}

export default function ClientsPage() {
  const { data: session, status } = useSession()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchClients()
    }
  }, [session])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm)
    
    return matchesSearch
  })

  const getStatusBadgeVariant = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      active: 'default',
      inactive: 'secondary',
    }
    return variants[status] || 'default'
  }

  const getPolicyStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      SUBMITTED: 'bg-yellow-500',
      PENDING: 'bg-orange-500',
      APPROVED: 'bg-blue-500',
      ISSUED: 'bg-green-500',
      PAID: 'bg-green-600',
      CHARGEBACK_RISK: 'bg-red-500',
      CHARGEBACKED: 'bg-red-600',
    }
    return colors[status] || 'bg-gray-500'
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-nexus-gold">Loading clients...</div>
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
            <h1 className="text-3xl font-bold text-white">Clients</h1>
            <p className="text-gray-400 mt-1">Manage your client relationships and policies</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/clients/add">
              <Button className="bg-nexus-gold text-black hover:bg-yellow-500">
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search clients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="bg-gray-900 border-gray-800 hover:border-nexus-gold transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">
                        {client.firstName} {client.lastName}
                      </CardTitle>
                      <Badge variant={getStatusBadgeVariant(client.status)}>
                        {client.status}
                      </Badge>
                    </div>
                  </div>
                  <Link href={`/clients/${client.id}`}>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Phone className="h-4 w-4" />
                  <span>{formatPhone(client.phone)}</span>
                </div>
                
                {client.email && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-gray-300">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">
                    Total Premium: {formatCurrency(client.totalPremium)}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-gray-300">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">
                    {client.policies.length} {client.policies.length === 1 ? 'Policy' : 'Policies'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Since: {new Date(client.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Recent Policies */}
                {client.policies.length > 0 && (
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400 mb-2">Recent Policies:</p>
                    <div className="space-y-1">
                      {client.policies.slice(0, 2).map((policy) => (
                        <div key={policy.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-300">
                            {policy.carrier} - {policy.productType}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-nexus-gold">
                              {formatCurrency(policy.premium)}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${getPolicyStatusColor(policy.status)}`} />
                          </div>
                        </div>
                      ))}
                      {client.policies.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{client.policies.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <div className="text-center py-12 max-w-md mx-auto">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white">
              {clients.length === 0 ? 'No clients yet' : 'No clients found'}
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              {clients.length === 0 
                ? 'Get started by adding your first client' 
                : 'Try adjusting your search criteria'}
            </p>
            {clients.length === 0 && (
              <div className="mt-6">
                <Link href="/clients/add">
                  <Button className="bg-nexus-gold text-black hover:bg-yellow-500">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}