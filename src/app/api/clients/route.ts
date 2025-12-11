import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clients = await db.client.findMany({
      where: {
        agentId: session.user.id
      },
      include: {
        policies: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match our frontend interface
    const transformedClients = clients.map(client => {
      const totalPremium = client.policies.reduce((sum, policy) => 
        sum + Number(policy.premium || 0), 0
      )

      return {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        policies: client.policies.map(policy => ({
          id: policy.id,
          carrier: policy.carrier,
          productType: policy.productType,
          faceAmount: policy.faceAmount ? Number(policy.faceAmount) : undefined,
          premium: Number(policy.premium || 0),
          status: policy.status,
          issueDate: policy.issueDate?.toISOString().split('T')[0]
        })),
        totalPremium,
        status: 'active' as const, // Mock status based on active policies
        createdAt: client.createdAt.toISOString()
      }
    })

    return NextResponse.json(transformedClients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, leadId } = body

    // Create client
    const client = await db.client.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        agentId: session.user.id,
        leadId
      }
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}