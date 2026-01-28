import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
    try {
        // Check if service key is configured
        if (!supabaseServiceKey) {
            return NextResponse.json(
                { error: 'Server not configured for admin operations. Add SUPABASE_SERVICE_ROLE_KEY to .env.local' },
                { status: 500 }
            )
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        const body = await request.json()
        const { email, password, fullName, role, department } = body

        // Validate required fields
        if (!email || !password || !fullName || !role) {
            return NextResponse.json(
                { error: 'Email, password, fullName, and role are required' },
                { status: 400 }
            )
        }

        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                full_name: fullName,
                role,
                department,
            }
        })

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        if (!authData.user) {
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
        }

        // Create profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: authData.user.id,
                email,
                full_name: fullName,
                role,
                department: department || null,
            })

        if (profileError) {
            // Rollback: delete auth user if profile creation fails
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            return NextResponse.json({ error: 'Failed to create profile: ' + profileError.message }, { status: 500 })
        }

        return NextResponse.json({
            message: 'User created successfully',
            user: {
                id: authData.user.id,
                email: authData.user.email,
                role,
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// GET all users (for admin)
export async function GET() {
    try {
        if (!supabaseServiceKey) {
            return NextResponse.json(
                { error: 'Server not configured for admin operations' },
                { status: 500 }
            )
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ users: data })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
