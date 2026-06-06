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

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .is('user_id', null)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(categories || [])
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
