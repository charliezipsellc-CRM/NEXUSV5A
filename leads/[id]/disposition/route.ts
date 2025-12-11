import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { validateData, createErrorResponse, createSuccessResponse } from '@/lib/validation'
import { callDispositionSchema } from '@/lib/validation'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse(new Error('Unauthorized'), '/api/leads/:id/disposition'), { status: 401 })
    }

    const body = await request.json()
    const { disposition, notes, callbackDate, appointmentDate } = validateData(callDispositionSchema, body)

    // Check if lead exists and belongs to user
    const lead = await db.lead.findUnique({
      where: {
        id: params.id,
        ownerId: session.user.id
      }
    })

    if (!lead) {
      return NextResponse.json(createErrorResponse(new Error('Lead not found'), '/api/leads/:id/disposition'), { status: 404 })
    }

    // Update lead status based on disposition
    let newStatus = lead.status
    switch (disposition) {
      case 'NO_ANSWER':
        newStatus = 'CONTACTED'
        break
      case 'NOT_INTERESTED':
        newStatus = 'DEAD'
        break
      case 'CALLBACK':
        newStatus = 'CONTACTED'
        break
      case 'SET':
        newStatus = 'SET'
        break
      case 'SAT':
        newStatus = 'SAT'
        break
      case 'SALE':
        newStatus = 'CLOSED'
        break
      case 'DEAD':
        newStatus = 'DEAD'
        break
    }

    // Update lead status
    const updatedLead = await db.lead.update({
      where: {
        id: params.id
      },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    })

    // Log the activity
    await db.leadActivity.create({
      data: {
        type: 'status_change',
        description: `Lead status changed to ${newStatus}. Disposition: ${disposition}. ${notes || ''}`,
        leadId: params.id,
        userId: session.user.id
      }
    })

    // Handle appointment creation if needed
    if (disposition === 'SET' && appointmentDate) {
      await db.appointment.create({
        data: {
          title: `Appointment with ${lead.firstName} ${lead.lastName}`,
          startTime: new Date(appointmentDate),
          endTime: new Date(new Date(appointmentDate).getTime() + 60 * 60 * 1000), // 1 hour later
          userId: session.user.id,
          leadId: params.id
        }
      })
    }

    // Handle callback scheduling if needed
    if (disposition === 'CALLBACK' && callbackDate) {
      await db.task.create({
        data: {
          title: `Call back ${lead.firstName} ${lead.lastName}`,
          description: `Scheduled callback from lead disposition`,
          priority: 'MEDIUM',
          status: 'PENDING',
          dueDate: new Date(callbackDate),
          createdById: session.user.id,
          assignedToId: session.user.id
        }
      })
    }

    return NextResponse.json(createSuccessResponse('Disposition recorded successfully', updatedLead))
  } catch (error) {
    console.error('Error recording disposition:', error)
    return NextResponse.json(createErrorResponse(error as Error, '/api/leads/:id/disposition'), { status: 500 })
  }
}