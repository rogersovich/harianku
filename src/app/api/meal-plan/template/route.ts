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

    const { data: templates, error } = await supabase
      .from('meal_plan_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(templates)
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

    const { name, meal_plan_id } = await request.json()

    if (!name || !meal_plan_id) {
      return NextResponse.json({ error: 'Nama template dan meal plan ID wajib diisi' }, { status: 400 })
    }

    // Fetch slots of the meal plan
    const { data: slots, error: fetchErr } = await supabase
      .from('meal_plan_slots')
      .select('day_of_week, slot, recipe_id')
      .eq('meal_plan_id', meal_plan_id)

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 })
    }

    if (!slots || slots.length === 0) {
      return NextResponse.json({ error: 'Meal plan kosong, tidak bisa dijadikan template' }, { status: 400 })
    }

    // Create template
    const { data: template, error: createErr } = await supabase
      .from('meal_plan_templates')
      .insert({
        user_id: user.id,
        name,
        slots: slots // JSON array
      })
      .select()
      .single()

    if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, template })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
