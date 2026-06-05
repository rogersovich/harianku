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

    const { data: stock, error } = await supabase
      .from('stock_items')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(stock)
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

    const { name, amount, unit, price_per_unit, threshold_amount } = await request.json()

    if (!name || amount === undefined || !unit) {
      return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 })
    }

    // Check if item already exists
    const { data: existing } = await supabase
      .from('stock_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name.trim())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Bahan sudah ada di stok. Update jumlahnya saja.' }, { status: 400 })
    }

    const { data: newItem, error } = await supabase
      .from('stock_items')
      .insert({
        user_id: user.id,
        name: name.trim(),
        amount: Number(amount),
        unit,
        price_per_unit: price_per_unit ? Number(price_per_unit) : null,
        threshold_amount: threshold_amount ? Number(threshold_amount) : 0,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, item: newItem })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
