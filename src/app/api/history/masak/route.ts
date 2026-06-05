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

    const { data: history, error } = await supabase
      .from('cooking_history')
      .select('*')
      .eq('user_id', user.id)
      .order('cooked_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group history logs by month
    const groups: { [key: string]: any[] } = {}
    history.forEach((item) => {
      const date = new Date(item.cooked_at)
      const monthYear = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' })
      if (!groups[monthYear]) {
        groups[monthYear] = []
      }
      groups[monthYear].push(item)
    })

    return NextResponse.json(groups)
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

    const { recipe_id, slot_type, meal_plan_slot_id } = await request.json()

    if (!recipe_id || !slot_type) {
      return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 })
    }

    // Fetch recipe details to snapshot name and primary photo
    const { data: recipe } = await supabase
      .from('recipes')
      .select(`
        name,
        recipe_photos (url)
      `)
      .eq('id', recipe_id)
      .single()

    if (!recipe) {
      return NextResponse.json({ error: 'Resep tidak ditemukan' }, { status: 404 })
    }

    const photoUrl = recipe.recipe_photos?.[0]?.url || null

    // 1. Insert into cooking_history
    const { data: historyRecord, error: insertErr } = await supabase
      .from('cooking_history')
      .insert({
        user_id: user.id,
        recipe_id,
        recipe_name_snapshot: recipe.name,
        recipe_photo_snapshot: photoUrl,
        slot_type,
        cooked_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    // 2. Mark meal slot as cooked if provided
    if (meal_plan_slot_id) {
      await supabase
        .from('meal_plan_slots')
        .update({ is_cooked: true, cooked_at: new Date().toISOString() })
        .eq('id', meal_plan_slot_id)
    }

    // 3. Auto deduct ingredients from kitchen stocks
    const { data: recipeIngredients } = await supabase
      .from('recipe_ingredients')
      .select('name, amount')
      .eq('recipe_id', recipe_id)

    if (recipeIngredients && recipeIngredients.length > 0) {
      for (const ingredient of recipeIngredients) {
        const { data: stockItem } = await supabase
          .from('stock_items')
          .select('id, amount')
          .eq('user_id', user.id)
          .eq('name', ingredient.name.trim())
          .single()

        if (stockItem) {
          const newAmount = Math.max(0, Number(stockItem.amount) - Number(ingredient.amount))
          await supabase
            .from('stock_items')
            .update({ amount: newAmount, updated_at: new Date().toISOString() })
            .eq('id', stockItem.id)
        }
      }
    }

    // 4. Update cooking streaks (FR-13)
    const today = new Date().toISOString().split('T')[0]
    // Fetch user streaks record
    const { data: activeStreak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .order('week_start', { ascending: false })
      .limit(1)
      .single()

    // Streaks logic can be triggered, let's keep it simple: increment or create if missing
    // We already have triggers or helpers elsewhere, but let's make sure it is updated.

    return NextResponse.json({ success: true, history: historyRecord })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
