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

    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    // Get today's activities
    const todayActivities = await db.leadActivity.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfDay
        }
      },
      select: {
        type: true,
        description: true
      }
    })

    // Calculate metrics from today's activities
    const dials = todayActivities.filter(activity => 
      activity.type === 'call' || activity.description?.includes('dialed')
    ).length

    const contacts = todayActivities.filter(activity => 
      activity.type === 'call' && !activity.description?.includes('no answer')
    ).length

    const appointmentsSet = todayActivities.filter(activity => 
      activity.type === 'appointment' || activity.description?.includes('appointment set')
    ).length

    const applications = todayActivities.filter(activity => 
      activity.type === 'application' || activity.description?.includes('application submitted')
    ).length

    // Get weekly goal (this would typically come from user preferences)
    const weeklyGoal = 100
    const monthlyGoal = 400

    const metrics = {
      dials,
      contacts,
      appointmentsSet,
      appointmentsSat: 0, // This would come from appointment data
      applications,
      weeklyGoal,
      monthlyGoal
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}