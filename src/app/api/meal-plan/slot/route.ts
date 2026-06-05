import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { meal_plan_id, day_of_week, slot, recipe_id } = await request.json()

    if (!meal_plan_id || !day_of_week || !slot || !recipe_id) {
      return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 })
    }

    // Insert slot
    const { data, error } = await supabase
      .from('meal_plan_slots')
      .insert({
        meal_plan_id,
        day_of_week: Number(day_of_week),
        slot,
        recipe_id,
        is_cooked: false
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, slot: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
