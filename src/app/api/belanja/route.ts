import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch stock items where current amount is below the warning threshold
    const { data: stockItems, error } = await supabase
      .from('stock_items')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter items below threshold
    const lowStockItems = (stockItems || []).filter(
      item => Number(item.amount) < Number(item.threshold_amount)
    )

    // Calculate required details
    let totalEstimatedCost = 0
    const list = lowStockItems.map((item) => {
      const required = Number(item.threshold_amount) - Number(item.amount)
      const cost = required * Number(item.price_per_unit || 0)
      totalEstimatedCost += cost

      return {
        id: item.id,
        name: item.name,
        current_amount: item.amount,
        threshold_amount: item.threshold_amount,
        unit: item.unit,
        required_amount: required,
        price_per_unit: item.price_per_unit || 0,
        estimated_cost: cost
      }
    })

    return NextResponse.json({
      items: list,
      total_estimated_cost: totalEstimatedCost
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items } = await request.json()
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Daftar item belanja wajib disertakan' }, { status: 400 })
    }

    // Restock each purchased item
    for (const item of items) {
      const { data: stockItem } = await supabase
        .from('stock_items')
        .select('amount')
        .eq('id', item.id)
        .eq('user_id', user.id)
        .single()

      if (stockItem) {
        const newAmount = Number(stockItem.amount) + Number(item.quantityToRestock)
        await supabase
          .from('stock_items')
          .update({ amount: newAmount, updated_at: new Date().toISOString() })
          .eq('id', item.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
