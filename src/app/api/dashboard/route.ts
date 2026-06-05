import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWeekStartAndEnd, getDayOfWeekWIB, getWIBDateString } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const todayStr = getWIBDateString()
    const { start: weekStart } = getWeekStartAndEnd()
    const dayOfWeek = getDayOfWeekWIB()

    // 1. Fetch Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // 2. Fetch Streaks (Cooking & Workout) for this week
    let { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single()

    if (!streak) {
      // Create a streak record for the week if it doesn't exist
      const { data: newStreak } = await supabase
        .from('streaks')
        .insert({
          user_id: user.id,
          week_start: weekStart,
          cooking_streak: 0,
          workout_streak: 0,
          cooking_days: {},
          workout_days: {},
        })
        .select()
        .single()
      streak = newStreak
    }

    // 3. Fetch Meal Plan for today
    const { data: mealPlan } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single()

    let todaySlots: any[] = []
    let todayNotes = ''

    if (mealPlan) {
      const { data: slots } = await supabase
        .from('meal_plan_slots')
        .select(`
          id,
          day_of_week,
          slot,
          is_cooked,
          cooked_at,
          recipe_id,
          recipes (
            id,
            name,
            estimated_time_minutes,
            category_id,
            categories (
              id,
              name,
              color
            )
          )
        `)
        .eq('meal_plan_id', mealPlan.id)
        .eq('day_of_week', dayOfWeek)

      if (slots) {
        todaySlots = slots
      }
      
      // Get note for today
      if (mealPlan.notes) {
        const notesObj = typeof mealPlan.notes === 'string' ? JSON.parse(mealPlan.notes) : mealPlan.notes
        todayNotes = notesObj[String(dayOfWeek)] || ''
      }
    }

    // 4. Fetch Workout Log for today
    const { data: workoutLog } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayStr)
      .single()

    return NextResponse.json({
      profile,
      streak,
      meals: todaySlots,
      notes: todayNotes,
      workout: workoutLog || { is_completed: false, type: null, proof_photo_url: null, notes: '' },
      todayStr,
      dayOfWeek
    })
  } catch (err: any) {
    console.error('Dashboard API Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST or PUT to save today's notes
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notes } = await request.json()
    const { start: weekStart } = getWeekStartAndEnd()
    const dayOfWeek = getDayOfWeekWIB()

    // Get or create meal plan
    let { data: mealPlan } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single()

    let currentNotes: any = {}

    if (mealPlan) {
      currentNotes = typeof mealPlan.notes === 'string' ? JSON.parse(mealPlan.notes) : (mealPlan.notes || {})
      currentNotes[String(dayOfWeek)] = notes

      await supabase
        .from('meal_plans')
        .update({ notes: currentNotes })
        .eq('id', mealPlan.id)
    } else {
      currentNotes[String(dayOfWeek)] = notes
      await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          week_start: weekStart,
          notes: currentNotes
        })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Dashboard Note Save Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
