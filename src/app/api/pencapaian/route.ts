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

    // 1. Fetch user stats for badge eligibility checks
    const { count: recipeCount } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: cookedCount } = await supabase
      .from('cooking_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: workoutCount } = await supabase
      .from('workout_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_completed', true)

    const { count: stockCount } = await supabase
      .from('stock_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // 2. Fetch all badges
    const { data: badges, error: badgesErr } = await supabase
      .from('badges')
      .select('*')

    if (badgesErr) {
      return NextResponse.json({ error: badgesErr.message }, { status: 500 })
    }

    // 3. Fetch user's earned badges
    const { data: earned, error: earnedErr } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id)

    if (earnedErr) {
      return NextResponse.json({ error: earnedErr.message }, { status: 500 })
    }

    const earnedBadgeIds = new Set(earned.map(e => e.badge_id))
    const earnedDatesMap = new Map(earned.map(e => [e.badge_id, e.earned_at]))

    // 4. Badge check & auto-award engine
    const newEarnedBadges = []
    for (const badge of (badges || [])) {
      if (earnedBadgeIds.has(badge.id)) continue

      let eligible = false
      const triggerVal = Number(badge.trigger_value || 0)

      switch (badge.trigger_type) {
        case 'recipes_created':
          eligible = (recipeCount || 0) >= triggerVal
          break
        case 'meals_cooked':
          eligible = (cookedCount || 0) >= triggerVal
          break
        case 'workouts_completed':
          eligible = (workoutCount || 0) >= triggerVal
          break
        case 'stock_items_count':
          eligible = (stockCount || 0) >= triggerVal
          break
      }

      if (eligible) {
        const { data: newBadge, error: insertErr } = await supabase
          .from('user_badges')
          .insert({
            user_id: user.id,
            badge_id: badge.id,
            earned_at: new Date().toISOString()
          })
          .select()
          .single()

        if (!insertErr && newBadge) {
          earnedBadgeIds.add(badge.id)
          earnedDatesMap.set(badge.id, newBadge.earned_at)
          newEarnedBadges.push(badge)
        }
      }
    }

    // 5. Combine and construct response list
    const badgeList = (badges || []).map((badge) => {
      const isEarned = earnedBadgeIds.has(badge.id)
      const earnedAt = earnedDatesMap.get(badge.id) || null
      
      // Dynamic unlock condition hint
      let hint = ''
      switch (badge.trigger_type) {
        case 'recipes_created':
          hint = `Buat minimal ${badge.trigger_value} resep pribadi`
          break
        case 'meals_cooked':
          hint = `Masak resep dari plan sebanyak ${badge.trigger_value} kali`
          break
        case 'workouts_completed':
          hint = `Selesaikan minimal ${badge.trigger_value} kali olahraga`
          break
        case 'stock_items_count':
          hint = `Miliki minimal ${badge.trigger_value} jenis bahan di stok Dapur`
          break
      }

      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        is_earned: isEarned,
        earned_at: earnedAt,
        hint
      }
    })

    // Fetch user streaks (cooking / workout)
    const { data: streaks } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .order('week_start', { ascending: false })

    return NextResponse.json({
      total_earned: earnedBadgeIds.size,
      total_badges: badgeList.length,
      badges: badgeList,
      new_badges: newEarnedBadges,
      streaks: streaks || []
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
