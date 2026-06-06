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

export async function GET() {
  try {
    const supabase = await createClient()
    const user = await checkAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        *,
        categories (
          id,
          name,
          color
        ),
        recipe_ingredients (
          id,
          name,
          amount,
          unit,
          price_per_unit
        ),
        recipe_photos (
          id,
          url,
          type,
          is_primary
        )
      `)
      .eq('is_starter', true)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(recipes || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const user = await checkAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Insert recipe
    const { data: recipe, error: recipeErr } = await supabase
      .from('recipes')
      .insert({
        name,
        description,
        category_id: category_id || null,
        tags: tags || [],
        estimated_time_minutes: estimated_time_minutes ? Number(estimated_time_minutes) : null,
        servings: servings ? Number(servings) : 1,
        steps: steps || [],
        is_starter: true,
        user_id: null // System recipe
      })
      .select()
      .single()

    if (recipeErr || !recipe) {
      return NextResponse.json({ error: recipeErr?.message || 'Gagal menyimpan resep' }, { status: 500 })
    }

    // Insert ingredients
    if (ingredients && ingredients.length > 0) {
      const ingData = ingredients.map((ing: any) => ({
        recipe_id: recipe.id,
        name: ing.name,
        amount: Number(ing.amount),
        unit: ing.unit,
        price_per_unit: ing.price_per_unit ? Number(ing.price_per_unit) : null
      }))

      const { error: ingErr } = await supabase.from('recipe_ingredients').insert(ingData)
      if (ingErr) {
        console.error('Ingredients insert error:', ingErr)
      }
    }

    // Insert photo if provided
    if (photo_url) {
      await supabase.from('recipe_photos').insert({
        recipe_id: recipe.id,
        url: photo_url,
        type: 'reference',
        is_primary: true
      })
    }

    return NextResponse.json({ success: true, recipeId: recipe.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
