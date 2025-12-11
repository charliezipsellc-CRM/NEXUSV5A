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

    const recruitProfile = await db.recruitProfile.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!recruitProfile) {
      return NextResponse.json({ error: 'Recruit profile not found' }, { status: 404 })
    }

    // Transform the data to match our frontend interface
    const transformedProfile = {
      id: recruitProfile.id,
      status: recruitProfile.status,
      phone: recruitProfile.phone,
      address: recruitProfile.address,
      city: recruitProfile.city,
      state: recruitProfile.state,
      zipCode: recruitProfile.zipCode,
      dateOfBirth: recruitProfile.dateOfBirth?.toISOString().split('T')[0],
      submittedAt: recruitProfile.createdAt.toISOString(),
      approvedAt: recruitProfile.updatedAt.toISOString()
    }

    return NextResponse.json(transformedProfile)
  } catch (error) {
    console.error('Error fetching recruit profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recruit profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { phone, address, city, state, zipCode, dateOfBirth } = body

    // Update recruit profile
    const recruitProfile = await db.recruitProfile.update({
      where: {
        userId: session.user.id
      },
      data: {
        phone,
        address,
        city,
        state,
        zipCode,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
      }
    })

    return NextResponse.json(recruitProfile)
  } catch (error) {
    console.error('Error updating recruit profile:', error)
    return NextResponse.json(
      { error: 'Failed to update recruit profile' },
      { status: 500 }
    )
  }
}