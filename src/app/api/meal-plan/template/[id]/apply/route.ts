import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: templateId } = await params
    const { week_start } = await request.json()

    if (!week_start) {
      return NextResponse.json({ error: 'Week start date required' }, { status: 400 })
    }

    // 1. Fetch template
    const { data: template, error: tempErr } = await supabase
      .from('meal_plan_templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single()

    if (tempErr || !template) {
      return NextResponse.json({ error: 'Template tidak ditemukan' }, { status: 404 })
    }

    // 2. Get or Create Meal Plan for target week
    let { data: mealPlan } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('user_id', user.id)
      .eq('week_start', week_start)
      .single()

    if (!mealPlan) {
      const { data: newPlan, error: planErr } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          week_start,
          notes: {}
        })
        .select()
        .single()
      
      if (planErr || !newPlan) {
        return NextResponse.json({ error: planErr?.message || 'Gagal membuat meal plan' }, { status: 500 })
      }
      mealPlan = newPlan
    }

    // 3. Clear target week's existing slots
    await supabase
      .from('meal_plan_slots')
      .delete()
      .eq('meal_plan_id', mealPlan!.id)

    // 4. Insert template slots
    const templateSlots = template.slots as any[]
    
    if (templateSlots && templateSlots.length > 0) {
      const newSlots = templateSlots.map((slot: any) => ({
        meal_plan_id: mealPlan!.id,
        day_of_week: Number(slot.day_of_week),
        slot: slot.slot,
        recipe_id: slot.recipe_id,
        is_cooked: false
      }))

      const { error: insertErr } = await supabase
        .from('meal_plan_slots')
        .insert(newSlots)

      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
