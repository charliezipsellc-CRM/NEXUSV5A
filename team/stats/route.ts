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

    // Get team statistics
    const teamStats = await db.user.findMany({
      where: {
        agencyId: session.user.agencyId,
        role: {
          in: ['AGENT', 'SENIOR_AGENT']
        }
      },
      include: {
        agentProfile: true
      }
    })

    // Calculate statistics
    const totalMembers = teamStats.length
    const activeMembers = teamStats.filter(member => 
      member.agentProfile && member.agentProfile.totalApps > 0
    ).length
    
    const totalWeeklyAP = teamStats.reduce((sum, member) => 
      sum + (member.agentProfile?.totalPremium || 0), 0
    )
    
    const totalMonthlyAP = totalWeeklyAP * 4 // Rough estimate
    
    const totalApps = teamStats.reduce((sum, member) => 
      sum + (member.agentProfile?.totalApps || 0), 0
    )

    // Mock drift alerts count
    const driftAlerts = Math.floor(totalMembers * 0.2) // 20% of team has alerts

    const stats = {
      totalMembers,
      weeklyAP: totalWeeklyAP,
      monthlyAP: totalMonthlyAP,
      totalApps,
      activeMembers,
      driftAlerts
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching team stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team stats' },
      { status: 500 }
    )
  }
}