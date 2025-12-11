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

    const now = new Date()
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago

    // Get leads that are ready for dialing
    // Priority: NEW leads first, then CONTACTED leads that haven't been called recently
    const leads = await db.lead.findMany({
      where: {
        ownerId: session.user.id,
        status: {
          in: ['NEW', 'CONTACTED']
        },
        // Exclude leads that were contacted in the last 2 hours
        NOT: {
          activities: {
            some: {
              type: 'call',
              createdAt: {
                gte: twoHoursAgo
              }
            }
          }
        }
      },
      orderBy: [
        // NEW leads first
        { status: 'asc' },
        // Then by creation date (oldest first)
        { createdAt: 'asc' },
        // Then by last activity
        { activities: { _count: 'asc' } }
      ],
      take: 50 // Limit to 50 leads per session
    })

    // Transform the data to match our frontend interface
    const transformedLeads = leads.map(lead => ({
      id: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      age: lead.age,
      state: lead.state,
      status: lead.status,
      source: lead.source,
      notes: lead.notes,
      tag: lead.tag,
      createdAt: lead.createdAt.toISOString()
    }))

    return NextResponse.json(transformedLeads)
  } catch (error) {
    console.error('Error fetching dial-ready leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}