import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { createErrorResponse, createSuccessResponse } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse(new Error('Unauthorized'), '/api/lead-batches'), { status: 401 })
    }

    const batches = await db.leadBatch.findMany({
      where: {
        ownerId: session.user.id
      },
      include: {
        vendor: true,
        leads: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        purchaseDate: 'desc'
      }
    })

    // Calculate ROI and other metrics for each batch
    const transformedBatches = batches.map(batch => {
      const totalLeads = batch.leads.length
      const contactedLeads = batch.leads.filter(lead => 
        ['CONTACTED', 'SET', 'SAT', 'CLOSED'].includes(lead.status)
      ).length
      const closedLeads = batch.leads.filter(lead => lead.status === 'CLOSED').length
      
      // Calculate ROI (assuming average premium of $2000)
      const averagePremium = 2000
      const totalRevenue = closedLeads * averagePremium
      const totalCost = Number(batch.cost)
      const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0

      return {
        id: batch.id,
        name: batch.name,
        cost: Number(batch.cost),
        size: batch.size,
        purchaseDate: batch.purchaseDate.toISOString(),
        vendor: batch.vendor?.name || 'Unknown',
        vendorType: batch.vendor?.type || 'THIRD_PARTY',
        totalLeads,
        contactedLeads,
        closedLeads,
        contactRate: totalLeads > 0 ? (contactedLeads / totalLeads) * 100 : 0,
        conversionRate: totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0,
        roi: Math.round(roi * 100) / 100
      }
    })

    return NextResponse.json(createSuccessResponse('Lead batches retrieved successfully', transformedBatches))
  } catch (error) {
    console.error('Error fetching lead batches:', error)
    return NextResponse.json(createErrorResponse(error as Error, '/api/lead-batches'), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse(new Error('Unauthorized'), '/api/lead-batches'), { status: 401 })
    }

    const body = await request.json()
    const { name, cost, size, vendorId } = body

    if (!name || !cost || !size) {
      return NextResponse.json(createErrorResponse(new Error('Missing required fields'), '/api/lead-batches'), { status: 400 })
    }

    // Create lead batch
    const batch = await db.leadBatch.create({
      data: {
        name,
        cost,
        size,
        purchaseDate: new Date(),
        vendorId: vendorId || 'default-vendor',
        ownerId: session.user.id
      },
      include: {
        vendor: true
      }
    })

    return NextResponse.json(createSuccessResponse('Lead batch created successfully', batch), { status: 201 })
  } catch (error) {
    console.error('Error creating lead batch:', error)
    return NextResponse.json(createErrorResponse(error as Error, '/api/lead-batches'), { status: 500 })
  }
}