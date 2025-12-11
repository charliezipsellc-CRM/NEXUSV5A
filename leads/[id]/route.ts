import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { validateData, createErrorResponse, createSuccessResponse } from '@/lib/validation'
import { leadSchema } from '@/lib/validation'

// Get single lead
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse(new Error('Unauthorized'), '/api/leads/:id'), { status: 401 })
    }

    const lead = await db.lead.findUnique({
      where: {
        id: params.id,
        ownerId: session.user.id // Ensure user owns the lead
      },
      include: {
        activities: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        batch: {
          include: {
            vendor: true
          }
        }
      }
    })

    if (!lead) {
      return NextResponse.json(createErrorResponse(new Error('Lead not found'), '/api/leads/:id'), { status: 404 })
    }

    return NextResponse.json(createSuccessResponse('Lead retrieved successfully', lead))
  } catch (error) {
    console.error('Error fetching lead:', error)
    return NextResponse.json(createErrorResponse(error as Error, '/api/leads/:id'), { status: 500 })
  }
}

// Update lead
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse(new Error('Unauthorized'), '/api/leads/:id'), { status: 401 })
    }

    const body = await request.json()
    const validatedData = validateData(leadSchema.partial(), body)

    // Check if lead exists and belongs to user
    const existingLead = await db.lead.findUnique({
      where: {
        id: params.id,
        ownerId: session.user.id
      }
    })

    if (!existingLead) {
      return NextResponse.json(createErrorResponse(new Error('Lead not found'), '/api/leads/:id'), { status: 404 })
    }

    // Update lead
    const lead = await db.lead.update({
      where: {
        id: params.id
      },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    })

    // Log the update activity
    await db.leadActivity.create({
      data: {
        type: 'updated',
        description: `Lead updated: ${Object.keys(validatedData).join(', ')}`,
        leadId: params.id,
        userId: session.user.id
      }
    })

    return NextResponse.json(createSuccessResponse('Lead updated successfully', lead))
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json(createErrorResponse(error as Error, '/api/leads/:id'), { status: 500 })
  }
}

// Delete lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse(new Error('Unauthorized'), '/api/leads/:id'), { status: 401 })
    }

    // Check if lead exists and belongs to user
    const existingLead = await db.lead.findUnique({
      where: {
        id: params.id,
        ownerId: session.user.id
      }
    })

    if (!existingLead) {
      return NextResponse.json(createErrorResponse(new Error('Lead not found'), '/api/leads/:id'), { status: 404 })
    }

    // Soft delete by updating status
    const lead = await db.lead.update({
      where: {
        id: params.id
      },
      data: {
        status: 'DEAD',
        updatedAt: new Date()
      }
    })

    // Log the deletion activity
    await db.leadActivity.create({
      data: {
        type: 'deleted',
        description: 'Lead marked as dead',
        leadId: params.id,
        userId: session.user.id
      }
    })

    return NextResponse.json(createSuccessResponse('Lead deleted successfully', lead))
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json(createErrorResponse(error as Error, '/api/leads/:id'), { status: 500 })
  }
}