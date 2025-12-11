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

    // Get empire-wide statistics
    const totalAgencies = await db.agency.count()
    
    const totalAgents = await db.user.count({
      where: {
        role: {
          in: ['AGENT', 'SENIOR_AGENT']
        }
      }
    })

    const agentProfiles = await db.agentProfile.findMany({
      select: {
        totalPremium: true
      }
    })

    const totalWeeklyAP = agentProfiles.reduce((sum, profile) => 
      sum + (profile.totalPremium || 0), 0
    )
    
    const totalMonthlyAP = totalWeeklyAP * 4 // Rough estimate

    const activeRecruits = await db.recruitProfile.count({
      where: {
        status: {
          in: ['NEW', 'SUBMITTED_TO_TYLICA', 'AWAITING_FFL_EMAILS', 'LICENSED']
        }
      }
    })

    // Mock drift alerts - in real implementation, this would be calculated
    const driftAlerts = Math.floor(totalAgents * 0.15) // 15% of agents have alerts

    const stats = {
      totalAgencies,
      totalAgents,
      totalWeeklyAP,
      totalMonthlyAP,
      activeRecruits,
      driftAlerts
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching founder stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch founder stats' },
      { status: 500 }
    )
  }
}