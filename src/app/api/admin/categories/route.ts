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

    let { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .is('user_id', null)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let finalCategories = categories || []
    if (finalCategories.length === 0) {
      const defaultCats = [
        { name: 'Sarapan Cepat', color: '#FFD93D', user_id: null },
        { name: 'Masakan Berat', color: '#FF6B9D', user_id: null },
        { name: 'Menu Diet', color: '#6BCB77', user_id: null },
        { name: 'Favorit Keluarga', color: '#FF9A3C', user_id: null },
      ]

      const { data: inserted, error: insertError } = await supabase
        .from('categories')
        .insert(defaultCats)
        .select()

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
      finalCategories = inserted || []
    }

    // Auto-heal starter recipes with missing or invalid category relations
    const sarapan = finalCategories.find(c => c.name.toLowerCase().includes('sarapan'))
    const berat = finalCategories.find(c => c.name.toLowerCase().includes('berat'))
    const diet = finalCategories.find(c => c.name.toLowerCase().includes('diet'))
    const keluarga = finalCategories.find(c => c.name.toLowerCase().includes('keluarga'))

    const { data: starterRecipes } = await supabase
      .from('recipes')
      .select('id, name, category_id')
      .eq('is_starter', true)

    if (starterRecipes && starterRecipes.length > 0) {
      const defaultCategoryIds = finalCategories.map(c => c.id)
      for (const recipe of starterRecipes) {
        let targetCategory = sarapan || finalCategories[0]
        const recipeName = recipe.name.toLowerCase()

        if (recipeName.includes('salad') || recipeName.includes('sup') || recipeName.includes('detoks')) {
          targetCategory = diet || sarapan || finalCategories[0]
        } else if (recipeName.includes('dada') || recipeName.includes('quinoa') || recipeName.includes('salmon') || recipeName.includes('goreng')) {
          targetCategory = berat || finalCategories[0]
        } else if (recipeName.includes('pepes') || recipeName.includes('tahu')) {
          targetCategory = keluarga || finalCategories[0]
        } else if (recipeName.includes('oatmeal') || recipeName.includes('jus') || recipeName.includes('smoothie') || recipeName.includes('toast') || recipeName.includes('telur')) {
          targetCategory = sarapan || finalCategories[0]
        }

        if (!recipe.category_id || !defaultCategoryIds.includes(recipe.category_id)) {
          await supabase
            .from('recipes')
            .update({ category_id: targetCategory.id })
            .eq('id', recipe.id)
        }
      }
    }

    return NextResponse.json(finalCategories)
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

    const { name, color } = await request.json()
    if (!name || !color) {
      return NextResponse.json({ error: 'Nama dan warna wajib diisi' }, { status: 400 })
    }

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        color: color.trim(),
        user_id: null // System default category
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(category)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
