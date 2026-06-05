import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify role check
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { name, description, icon, trigger_type, trigger_value } = await request.json()

    if (!name || !description || !icon) {
      return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 })
    }

    const { data: badge, error } = await supabase
      .from('badges')
      .insert({
        name,
        description,
        icon,
        trigger_type: trigger_type || null,
        trigger_value: trigger_value ? Number(trigger_value) : null,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, badge })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
