import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return null
  return user
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const user = await checkAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      name,
      description,
      category_id,
      tags,
      estimated_time_minutes,
      servings,
      steps,
      ingredients, // Array: { name, amount, unit, price_per_unit }
      photo_url
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Nama resep wajib diisi' }, { status: 400 })
    }

    // Update recipe details
    const { error: recipeErr } = await supabase
      .from('recipes')
      .update({
        name,
        description,
        category_id: category_id || null,
        tags: tags || [],
        estimated_time_minutes: estimated_time_minutes ? Number(estimated_time_minutes) : null,
        servings: servings ? Number(servings) : 1,
        steps: steps || []
      })
      .eq('id', id)

    if (recipeErr) {
      return NextResponse.json({ error: recipeErr.message }, { status: 500 })
    }

    // Reset and insert ingredients
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', id)
    if (ingredients && ingredients.length > 0) {
      const ingData = ingredients.map((ing: any) => ({
        recipe_id: id,
        name: ing.name,
        amount: Number(ing.amount),
        unit: ing.unit,
        price_per_unit: ing.price_per_unit ? Number(ing.price_per_unit) : null
      }))
      await supabase.from('recipe_ingredients').insert(ingData)
    }

    // Reset and insert photo if provided
    await supabase.from('recipe_photos').delete().eq('recipe_id', id)
    if (photo_url) {
      await supabase.from('recipe_photos').insert({
        recipe_id: id,
        url: photo_url,
        type: 'reference',
        is_primary: true
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const user = await checkAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
