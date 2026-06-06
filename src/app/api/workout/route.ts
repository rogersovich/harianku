import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWeekStartAndEnd, getDayOfWeekWIB, getWIBDateString } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get('week') // Expected YYYY-MM-DD

    if (!weekStart) {
      return NextResponse.json({ error: 'Week start required' }, { status: 400 })
    }

    // Get the week end
    const monday = new Date(weekStart)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    
    const weekEnd = sunday.toISOString().split('T')[0]

    // Fetch workout logs for this week
    const { data: logs, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', weekStart)
      .lte('date', weekEnd)

    return NextResponse.json(logs || [])
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

    const { date, type, notes, proof_photo_url, is_completed } = await request.json()

    if (!date || !type) {
      return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 })
    }

    // Validasi agar hanya bisa unggah bukti/menyelesaikan workout pada hari-H
    if (is_completed) {
      const todayStr = getWIBDateString(new Date())
      if (date !== todayStr) {
        return NextResponse.json({ error: 'Bukti olahraga hanya dapat diunggah pada hari-H!' }, { status: 400 })
      }
    }

    // Check if workout log already exists for date
    const { data: existing } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .single()

    let workout: any

    const workoutData: any = {
      type,
      notes: notes || '',
      proof_photo_url: proof_photo_url || null,
      is_completed: !!is_completed
    }

    if (existing) {
      const { data, error } = await supabase
        .from('workout_logs')
        .update(workoutData)
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      workout = data
    } else {
      const { data, error } = await supabase
        .from('workout_logs')
        .insert({
          user_id: user.id,
          date,
          ...workoutData
        })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      workout = data
    }

    // If completed, update workout streak
    if (is_completed) {
      const { start: weekStart } = getWeekStartAndEnd(new Date(date))
      const dayOfWeek = getDayOfWeekWIB(new Date(date))

      // Get or create streaks record
      let { data: streak } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart)
        .single()

      if (!streak) {
        const { data: newStr } = await supabase
          .from('streaks')
          .insert({
            user_id: user.id,
            week_start: weekStart,
            cooking_streak: 0,
            workout_streak: 0,
            cooking_days: {},
            workout_days: {}
          })
          .select()
          .single()
        streak = newStr
      }

      if (streak) {
        const workoutDays = streak.workout_days || {}
        
        // If not already marked as completed for this day in streak
        if (!workoutDays[String(dayOfWeek)]) {
          let consecutiveDays = 1

          // Check backwards
          for (let i = dayOfWeek - 1; i >= 1; i--) {
            if (workoutDays[String(i)]) {
              consecutiveDays++
            } else {
              break
            }
          }

          workoutDays[String(dayOfWeek)] = true

          await supabase
            .from('streaks')
            .update({
              workout_days: workoutDays,
              workout_streak: consecutiveDays
            })
            .eq('id', streak.id)
        }
      }
    }

    return NextResponse.json({ success: true, workout })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
