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

    // Check if user is founder or platform owner
    if (session.user.role !== 'FOUNDER' && session.user.role !== 'PLATFORM_OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all agencies with their agent counts and performance
    const agencies = await db.agency.findMany({
      include: {
        users: {
          where: {
            role: {
              in: ['AGENT', 'SENIOR_AGENT', 'MANAGER', 'AGENCY_OWNER']
            }
          },
          include: {
            agentProfile: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to include calculated fields
    const transformedAgencies = agencies.map(agency => {
      const totalAgents = agency.users.filter(user => 
        ['AGENT', 'SENIOR_AGENT'].includes(user.role)
      ).length

      const weeklyAP = agency.users.reduce((sum, user) => 
        sum + (user.agentProfile?.totalPremium || 0), 0
      )

      const monthlyAP = weeklyAP * 4 // Rough estimate

      return {
        id: agency.id,
        name: agency.name,
        totalAgents,
        weeklyAP,
        monthlyAP,
        status: 'active' as const // Mock status
      }
    })

    return NextResponse.json(transformedAgencies)
  } catch (error) {
    console.error('Error fetching agencies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agencies' },
      { status: 500 }
    )
  }
}