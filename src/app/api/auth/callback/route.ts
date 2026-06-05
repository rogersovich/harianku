import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // Check if profile onboarding is completed
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, role')
        .eq('id', user.id)
        .single()
        
      if (profile) {
        if (profile.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin/dashboard`)
        }
        if (profile.onboarding_completed) {
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      }
      return NextResponse.redirect(`${origin}/onboarding`)
    }
  }

  // return the user to an error page or landing
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
