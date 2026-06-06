import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const isAdmin = await checkAdmin(supabase)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 1. Fetch all auth users
    const { data: { users }, error: authError } = await adminSupabase.auth.admin.listUsers()
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    // 2. Fetch profiles
    const { data: profiles, error: profileError } = await adminSupabase
      .from('profiles')
      .select('*')

    // 3. Fetch streaks
    const { data: streaks, error: streakError } = await adminSupabase
      .from('streaks')
      .select('user_id, cooking_streak, workout_streak')

    // 4. Fetch recipes
    const { data: recipes, error: recipeError } = await adminSupabase
      .from('recipes')
      .select('user_id, is_starter')

    const highestStreaks: Record<string, number> = {}
    if (streaks) {
      for (const s of streaks) {
        const maxVal = Math.max(s.cooking_streak || 0, s.workout_streak || 0)
        if (!highestStreaks[s.user_id] || maxVal > highestStreaks[s.user_id]) {
          highestStreaks[s.user_id] = maxVal
        }
      }
    }

    const recipesCount: Record<string, number> = {}
    if (recipes) {
      for (const r of recipes) {
        if (r.user_id && !r.is_starter) {
          recipesCount[r.user_id] = (recipesCount[r.user_id] || 0) + 1
        }
      }
    }

    const mergedUsers = users.map((u: any) => {
      const profile = profiles?.find((p: any) => p.id === u.id) || {}
      return {
        id: u.id,
        name: profile.name || u.raw_user_meta_data?.full_name || u.email?.split('@')[0] || 'User',
        email: u.email || '',
        created_at: profile.created_at || u.created_at, // join date
        last_sign_in_at: u.last_sign_in_at || null, // terakhir aktif
        highest_streak: highestStreaks[u.id] || 0,
        recipes_count: recipesCount[u.id] || 0,
        role: profile.role || 'user'
      }
    })

    const search = new URL(request.url).searchParams.get('search')?.toLowerCase() || ''
    let filteredUsers = mergedUsers
    if (search) {
      filteredUsers = mergedUsers.filter(
        (mu: any) =>
          mu.name?.toLowerCase().includes(search) ||
          mu.email?.toLowerCase().includes(search)
      )
    }

    return NextResponse.json(filteredUsers)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
