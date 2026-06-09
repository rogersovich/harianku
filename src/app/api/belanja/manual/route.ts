import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET: Fetch all manual shopping list items for current user
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: items, error } = await supabase
      .from('manual_shopping_list')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(items || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST: Add a new manual shopping list item
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama bahan belanjaan wajib diisi' }, { status: 400 })
    }

    const { data: item, error } = await supabase
      .from('manual_shopping_list')
      .insert({
        user_id: user.id,
        name: name.trim(),
        is_completed: false
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(item)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT: Toggle checklist status (single or bulk select-all)
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, is_completed, bulk } = await request.json()

    if (bulk) {
      // Toggle all items
      const { error } = await supabase
        .from('manual_shopping_list')
        .update({ is_completed })
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    } else {
      // Toggle single item
      if (!id) {
        return NextResponse.json({ error: 'ID item wajib disertakan' }, { status: 400 })
      }

      const { error } = await supabase
        .from('manual_shopping_list')
        .update({ is_completed })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE: Delete item (single or bulk delete completed)
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, clear_completed } = await request.json()

    if (clear_completed) {
      // Delete all completed items
      const { error } = await supabase
        .from('manual_shopping_list')
        .delete()
        .eq('user_id', user.id)
        .eq('is_completed', true)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    } else {
      // Delete single item
      if (!id) {
        return NextResponse.json({ error: 'ID item wajib disertakan' }, { status: 400 })
      }

      const { error } = await supabase
        .from('manual_shopping_list')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
