import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(): Promise<Response> {
  try {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        users:user_id (name, email),
        books:book_id (title, code)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching rentals:', error)
      return NextResponse.json({ error: 'Failed to fetch rentals' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Error in rentals API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}