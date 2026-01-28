import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/tickets/[id] - Get a single ticket
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const { data, error } = await supabase
            .from('tickets')
            .select(`
        *,
        reporter:profiles!tickets_reporter_id_fkey(*),
        assignee:profiles!tickets_assignee_id_fkey(*),
        category:categories(*),
        comments:ticket_comments(
          *,
          user:profiles(*)
        )
      `)
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PATCH /api/tickets/[id] - Update a ticket
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const body = await request.json()
        const { status, priority, assignee_id } = body

        const updates: Record<string, unknown> = {}
        if (status) updates.status = status
        if (priority) updates.priority = priority
        if (assignee_id !== undefined) updates.assignee_id = assignee_id

        // Set resolved_at if status is being set to resolved
        if (status === 'resolved') {
            updates.resolved_at = new Date().toISOString()
        }

        const { data, error } = await supabase
            .from('tickets')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE /api/tickets/[id] - Delete a ticket
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const { error } = await supabase
            .from('tickets')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ message: 'Ticket deleted successfully' })
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
