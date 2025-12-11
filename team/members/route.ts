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

    // Check if user is a manager or agency owner
    if (session.user.role !== 'MANAGER' && session.user.role !== 'AGENCY_OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get team members - for now, return all agents in the same agency
    const teamMembers = await db.user.findMany({
      where: {
        agencyId: session.user.agencyId,
        role: {
          in: ['AGENT', 'SENIOR_AGENT']
        }
      },
      include: {
        agentProfile: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match our frontend interface
    const transformedMembers = teamMembers.map(member => ({
      id: member.id,
      name: member.name || 'Unknown Agent',
      email: member.email,
      role: member.role,
      weeklyAP: member.agentProfile?.totalPremium || 0,
      monthlyAP: (member.agentProfile?.totalPremium || 0) * 4, // Rough estimate
      totalApps: member.agentProfile?.totalApps || 0,
      status: 'active', // Mock status
      lastActivity: '2 hours ago' // Mock last activity
    }))

    return NextResponse.json(transformedMembers)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}