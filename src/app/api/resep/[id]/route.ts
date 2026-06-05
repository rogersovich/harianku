import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data: recipe, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error || !recipe) {
      return NextResponse.json({ error: 'Resep tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(recipe)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

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
      is_favorite,
      ingredients,
      photo_url,
      rating,
      rating_notes
    } = body

    // Build update payload dynamically to only update fields present in request body
    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.category_id !== undefined) updateData.category_id = body.category_id || null
    if (body.tags !== undefined) updateData.tags = body.tags || []
    if (body.estimated_time_minutes !== undefined) {
      updateData.estimated_time_minutes = body.estimated_time_minutes ? Number(body.estimated_time_minutes) : null
    }
    if (body.servings !== undefined) {
      updateData.servings = body.servings ? Number(body.servings) : 1
    }
    if (body.steps !== undefined) updateData.steps = body.steps || []
    if (body.is_favorite !== undefined) updateData.is_favorite = !!body.is_favorite
    if (body.rating !== undefined) updateData.rating = body.rating
    if (body.rating_notes !== undefined) updateData.rating_notes = body.rating_notes

    if (Object.keys(updateData).length > 0) {
      const { error: recipeErr } = await supabase
        .from('recipes')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user owns the recipe

      if (recipeErr) {
        return NextResponse.json({ error: recipeErr.message }, { status: 500 })
      }
    }

    // Update ingredients if provided
    if (ingredients) {
      // Delete old ingredients
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', id)

      // Insert new ingredients
      if (ingredients.length > 0) {
        const ingData = ingredients.map((ing: any) => ({
          recipe_id: id,
          name: ing.name,
          amount: Number(ing.amount),
          unit: ing.unit,
          price_per_unit: ing.price_per_unit ? Number(ing.price_per_unit) : null
        }))

        await supabase.from('recipe_ingredients').insert(ingData)
      }
    }

    // Update photo if provided
    if (photo_url) {
      await supabase.from('recipe_photos').delete().eq('recipe_id', id).eq('type', 'reference')
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
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if recipe is assigned to active meal plans
    const { data: activeSlots } = await supabase
      .from('meal_plan_slots')
      .select('id')
      .eq('recipe_id', id)
      .limit(1)

    if (activeSlots && activeSlots.length > 0) {
      // We will warn but allow, or return error. Let's return a warning message
      // Actually, standard cascade delete is fine but we let the user confirm first.
    }

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
