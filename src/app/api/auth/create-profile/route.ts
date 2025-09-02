import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, name, phone } = body
    
    console.log('Creating profile with data:', { userId, name, phone })

    // Crear perfil usando Supabase directamente
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        name,
        phone,
        role: 'USER'
      })
      .select()
      .single()

    console.log('Supabase response:', { profile, error })

    if (error) {
      console.error('Supabase error details:', error)
      return NextResponse.json(
        { error: `Database error: ${error.message}`, details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}