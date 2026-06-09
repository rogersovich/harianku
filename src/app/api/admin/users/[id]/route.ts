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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const isAdmin = await checkAdmin(supabase)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

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

    // 1. Fetch Auth user
    const { data: { user: authUser }, error: authError } = await adminSupabase.auth.admin.getUserById(id)
    if (authError || !authUser) {
      return NextResponse.json({ error: 'User auth tidak ditemukan' }, { status: 404 })
    }

    // 2. Fetch Profile
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    // 3. Fetch Streaks
    const { data: streaks, error: streaksError } = await adminSupabase
      .from('streaks')
      .select('*')
      .eq('user_id', id)
      .order('week_start', { ascending: false })

    // 4. Fetch Recipes
    const { data: recipes, error: recipesError } = await adminSupabase
      .from('recipes')
      .select(`
        id,
        name,
        description,
        estimated_time_minutes,
        rating,
        created_at,
        categories (
          name,
          color
        )
      `)
      .eq('user_id', id)
      .eq('is_starter', false)
      .order('created_at', { ascending: false })

    // 5. Fetch Badges
    const { data: earnedBadges, error: badgesError } = await adminSupabase
      .from('user_badges')
      .select(`
        earned_at,
        badges (
          id,
          name,
          description,
          icon
        )
      `)
      .eq('user_id', id)
      .order('earned_at', { ascending: false })

    return NextResponse.json({
      user: {
        id: authUser.id,
        name: profile?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email,
        created_at: profile?.created_at || authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at || null,
        role: profile?.role || 'user',
        goal: profile?.goal || 'keduanya',
        workout_target_weekly: profile?.workout_target_weekly ?? 3,
        auto_repeat_meal: profile?.auto_repeat_meal ?? false,
      },
      streaks: streaks || [],
      recipes: recipes || [],
      badges: earnedBadges?.map((eb: any) => ({
        id: eb.badges?.id,
        name: eb.badges?.name,
        description: eb.badges?.description,
        icon: eb.badges?.icon,
        earned_at: eb.earned_at
      })) || []
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
