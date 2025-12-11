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

    const leads = await db.lead.findMany({
      where: {
        ownerId: session.user.id
      },
      include: {
        activities: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match our frontend interface
    const transformedLeads = leads.map(lead => ({
      id: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      source: lead.source,
      tag: lead.tag,
      createdAt: lead.createdAt.toISOString(),
      lastContact: lead.activities[0]?.createdAt.toISOString()
    }))

    return NextResponse.json(transformedLeads)
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
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
    const { firstName, lastName, email, phone, source, batchId } = body

    // Create lead
    const lead = await db.lead.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        source: source || 'MANUAL',
        status: 'NEW',
        ownerId: session.user.id,
        batchId: batchId || 'manual-entry'
      }
    })

    // Log activity
    await db.leadActivity.create({
      data: {
        type: 'created',
        description: 'Lead created manually',
        leadId: lead.id,
        userId: session.user.id
      }
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}