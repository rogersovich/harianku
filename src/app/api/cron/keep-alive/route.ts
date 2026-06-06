import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Verify Vercel Cron Secret if configured
  const authHeader = request.headers.get('Authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase credentials are not configured' },
        { status: 500 }
      )
    }

    // Initialize standalone client without cookies/auth context for cron
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Execute a query to keep the Supabase database instance active
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase pinged successfully',
      data,
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to ping Supabase' },
      { status: 500 }
    )
  }
}
