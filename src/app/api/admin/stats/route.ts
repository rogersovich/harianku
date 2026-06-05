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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Query stats
    // 1. Total users
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // 2. Total recipes
    const { count: recipeCount } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })

    // 3. Total starter recipes
    const { count: starterCount } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('is_starter', true)

    return NextResponse.json({
      userCount: userCount || 0,
      recipeCount: recipeCount || 0,
      starterCount: starterCount || 0,
      avgCookingStreak: 4.5, // Mock value
      popularRecipe: 'Oatmeal Pisang Cepat' // Mock value
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
