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

    // Get current week range (Monday to Sunday)
    const now = new Date()
    const day = now.getDay() // 0=Sunday, 1=Monday, etc.
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1)
    const startOfWeek = new Date(now.setDate(diffToMonday))
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    // Fetch cooking history for this week
    const { data: history, error } = await supabase
      .from('cooking_history')
      .select('*')
      .eq('user_id', user.id)
      .gte('cooked_at', startOfWeek.toISOString())
      .lte('cooked_at', endOfWeek.toISOString())

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch all stock items for price mapping
    const { data: stocks } = await supabase
      .from('stock_items')
      .select('name, price_per_unit')
      .eq('user_id', user.id)

    const stockPriceMap = new Map(stocks?.map(s => [s.name.toLowerCase().trim(), Number(s.price_per_unit || 0)]))

    // Daily expense array initialized for 7 days
    const dailyExpenses = [
      { day: 'Senin', total: 0 },
      { day: 'Selasa', total: 0 },
      { day: 'Rabu', total: 0 },
      { day: 'Kamis', total: 0 },
      { day: 'Jumat', total: 0 },
      { day: 'Sabtu', total: 0 },
      { day: 'Minggu', total: 0 }
    ]

    let totalExpense = 0
    let mostExpensive = { name: '-', cost: 0 }
    let cheapest = { name: '-', cost: Infinity }

    for (const record of (history || [])) {
      // Fetch recipe ingredients
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

      // Track expensive / cheapest
      if (recipeCost > mostExpensive.cost) {
        mostExpensive = { name: record.recipe_name_snapshot, cost: recipeCost }
      }
      if (recipeCost < cheapest.cost && recipeCost > 0) {
        cheapest = { name: record.recipe_name_snapshot, cost: recipeCost }
      }

      // Add to daily list
      const recordDay = new Date(record.cooked_at).getDay() // 0=Sunday, 1=Monday, etc.
      const index = recordDay === 0 ? 6 : recordDay - 1
      dailyExpenses[index].total += recipeCost
    }

    const averagePerDay = totalExpense / 7

    return NextResponse.json({
      total_expense: totalExpense,
      average_per_day: averagePerDay,
      most_expensive_recipe: mostExpensive,
      cheapest_recipe: cheapest.cost === Infinity ? { name: '-', cost: 0 } : cheapest,
      daily_chart_data: dailyExpenses
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
