import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get('week') // Expected: YYYY-MM-DD (Monday)

    if (!weekStart) {
      return NextResponse.json({ error: 'Week start date required' }, { status: 400 })
    }

    // Get or create meal plan for this week
    let { data: mealPlan } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single()

    if (!mealPlan) {
      const { data: newPlan, error: createErr } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          week_start: weekStart,
          notes: {}
        })
        .select()
        .single()
      
      if (createErr) {
        return NextResponse.json({ error: createErr.message }, { status: 500 })
      }
      mealPlan = newPlan
    }

    // Get slots
    const { data: slots } = await supabase
      .from('meal_plan_slots')
      .select(`
        id,
        day_of_week,
        slot,
        is_cooked,
        recipe_id,
        recipes (
          id,
          name,
          estimated_time_minutes,
          category_id,
          categories (
            name,
            color
          )
        )
      `)
      .eq('meal_plan_id', mealPlan.id)

    return NextResponse.json({
      mealPlan,
      slots: slots || []
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
