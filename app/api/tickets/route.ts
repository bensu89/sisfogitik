import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET /api/tickets - List tickets
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const priority = searchParams.get('priority')
        const category = searchParams.get('category')
        const reporter_id = searchParams.get('reporter_id')
        const assignee_id = searchParams.get('assignee_id')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        let query = supabase
            .from('tickets')
            .select(`
        *,
        reporter:profiles!tickets_reporter_id_fkey(id, full_name, email),
        assignee:profiles!tickets_assignee_id_fkey(id, full_name, email),
        category:categories(id, name, color)
      `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (status) query = query.eq('status', status)
        if (priority) query = query.eq('priority', priority)
        if (category) query = query.eq('category_id', category)
        if (reporter_id) query = query.eq('reporter_id', reporter_id)
        if (assignee_id) query = query.eq('assignee_id', assignee_id)

        const { data, error, count } = await query

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            data,
            total: count,
            limit,
            offset,
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST /api/tickets - Create a new ticket
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { title, description, priority, category_id, reporter_id } = body

        if (!title || !description || !reporter_id) {
            return NextResponse.json(
                { error: 'Title, description, and reporter_id are required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('tickets')
            .insert({
                title,
                description,
                priority: priority || 'medium',
                category_id,
                reporter_id,
                status: 'open',
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
