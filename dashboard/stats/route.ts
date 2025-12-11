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

    // Get current date and date ranges
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get leads data
    const totalLeads = await db.lead.count({
      where: {
        ownerId: session.user.id
      }
    })

    const contactedLeads = await db.lead.count({
      where: {
        ownerId: session.user.id,
        status: {
          in: ['CONTACTED', 'SET', 'SAT', 'CLOSED']
        }
      }
    })

    const setAppointments = await db.lead.count({
      where: {
        ownerId: session.user.id,
        status: {
          in: ['SET', 'SAT', 'CLOSED']
        }
      }
    })

    const closedDeals = await db.lead.count({
      where: {
        ownerId: session.user.id,
        status: 'CLOSED'
      }
    })

    // Get financial data
    const weeklyTransactions = await db.financeTransaction.findMany({
      where: {
        userId: session.user.id,
        type: 'INCOME',
        date: {
          gte: weekAgo
        }
      },
      select: {
        amount: true
      }
    })

    const monthlyTransactions = await db.financeTransaction.findMany({
      where: {
        userId: session.user.id,
        type: 'INCOME',
        date: {
          gte: monthAgo
        }
      },
      select: {
        amount: true
      }
    })

    const weeklyAP = weeklyTransactions.reduce((sum, transaction) => 
      sum + Number(transaction.amount), 0
    )

    const monthlyAP = monthlyTransactions.reduce((sum, transaction) => 
      sum + Number(transaction.amount), 0
    )

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? (closedDeals / totalLeads) * 100 : 0

    const stats = {
      weeklyAP,
      monthlyAP,
      totalLeads,
      contactedLeads,
      setAppointments,
      closedDeals,
      conversionRate: Math.round(conversionRate * 10) / 10
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}