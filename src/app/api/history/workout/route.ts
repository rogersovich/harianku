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

    const { data: workouts, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', true)
      .order('date', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group workouts by month
    const groups: { [key: string]: any[] } = {}
    workouts.forEach((log) => {
      const date = new Date(log.date)
      const monthYear = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' })
      if (!groups[monthYear]) {
        groups[monthYear] = []
      }
      groups[monthYear].push(log)
    })

    return NextResponse.json(groups)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
