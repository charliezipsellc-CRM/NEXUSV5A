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

    const transactions = await db.financeTransaction.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        date: 'desc'
      },
      take: 100
    })

    // Transform the data to match our frontend interface
    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: Number(transaction.amount),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date.toISOString().split('T')[0]
    }))

    return NextResponse.json(transformedTransactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, amount, category, description, date } = body

    // Create transaction
    const transaction = await db.financeTransaction.create({
      data: {
        type,
        amount: amount,
        category,
        description,
        date: new Date(date),
        userId: session.user.id
      }
    })

    // Transform the data to match our frontend interface
    const transformedTransaction = {
      id: transaction.id,
      type: transaction.type,
      amount: Number(transaction.amount),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date.toISOString().split('T')[0]
    }

    return NextResponse.json(transformedTransaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}