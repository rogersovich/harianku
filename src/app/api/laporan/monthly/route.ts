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

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Fetch cooking history for this month
    const { data: history, error } = await supabase
      .from('cooking_history')
      .select('*')
      .gte('cooked_at', startOfMonth.toISOString())
      .lte('cooked_at', endOfMonth.toISOString())
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch stock item prices
    const { data: stocks } = await supabase
      .from('stock_items')
      .select('name, price_per_unit')
      .eq('user_id', user.id)

    const stockPriceMap = new Map(stocks?.map(s => [s.name.toLowerCase().trim(), Number(s.price_per_unit || 0)]))

    // Calculate weekly buckets for the month (Week 1, Week 2, Week 3, Week 4, Week 5)
    const weeklyBuckets = [
      { week: 'Minggu 1', total: 0 },
      { week: 'Minggu 2', total: 0 },
      { week: 'Minggu 3', total: 0 },
      { week: 'Minggu 4', total: 0 },
      { week: 'Minggu 5', total: 0 }
    ]

    let totalExpense = 0

    for (const record of (history || [])) {
      // Calculate recipe cost
      const { data: ingredients } = await supabase
        .from('recipe_ingredients')
        .select('name, amount')
        .eq('recipe_id', record.recipe_id)

      let recipeCost = 0
      if (ingredients) {
        ingredients.forEach((ing) => {
          const price = stockPriceMap.get(ing.name.toLowerCase().trim()) || 0
          recipeCost += Number(ing.amount) * price
        })
      }

      totalExpense += recipeCost

      // Determine which week of the month this cooked date falls into
      const cookedDate = new Date(record.cooked_at).getDate()
      const weekIndex = Math.min(4, Math.floor((cookedDate - 1) / 7))
      weeklyBuckets[weekIndex].total += recipeCost
    }

    return NextResponse.json({
      total_expense: totalExpense,
      weekly_breakdown: weeklyBuckets
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
