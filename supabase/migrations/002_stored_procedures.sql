-- ============================================
-- SIGIK Stored Procedures
-- For atomic ticket status updates
-- ============================================

-- Function to update ticket status atomically with logging
CREATE OR REPLACE FUNCTION update_ticket_status_atomic(
    p_ticket_id UUID,
    p_new_status ticket_status,
    p_user_id UUID,
    p_comment TEXT DEFAULT NULL,
    p_photo_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_status ticket_status;
    v_result JSONB;
BEGIN
    -- Get current status
    SELECT status INTO v_old_status
    FROM tickets
    WHERE id = p_ticket_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Ticket not found'
        );
    END IF;

    -- Update ticket
    UPDATE tickets
    SET 
        status = p_new_status,
        updated_at = NOW(),
        resolved_at = CASE 
            WHEN p_new_status IN ('resolved', 'closed') THEN NOW() 
            ELSE resolved_at 
        END,
        attachment_url = COALESCE(p_photo_url, attachment_url)
    WHERE id = p_ticket_id;

    -- Add comment if provided
    IF p_comment IS NOT NULL AND p_comment != '' THEN
        INSERT INTO ticket_comments (ticket_id, user_id, content, is_internal)
        VALUES (p_ticket_id, p_user_id, p_comment, false);
    END IF;

    -- Add status change log as internal comment
    INSERT INTO ticket_comments (ticket_id, user_id, content, is_internal)
    VALUES (
        p_ticket_id, 
        p_user_id, 
        'Status diubah dari ' || v_old_status::text || ' ke ' || p_new_status::text,
        true
    );

    v_result := jsonb_build_object(
        'success', true,
        'ticket_id', p_ticket_id,
        'old_status', v_old_status,
        'new_status', p_new_status,
        'updated_at', NOW()
    );

    RETURN v_result;
END;
$$;

-- Function to assign ticket to teknisi atomically
CREATE OR REPLACE FUNCTION assign_ticket_atomic(
    p_ticket_id UUID,
    p_assignee_id UUID,
    p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_assignee UUID;
    v_assignee_name TEXT;
    v_result JSONB;
BEGIN
    -- Get assignee name
    SELECT full_name INTO v_assignee_name
    FROM profiles
    WHERE id = p_assignee_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Assignee not found'
        );
    END IF;

    -- Get current assignee
    SELECT assignee_id INTO v_old_assignee
    FROM tickets
    WHERE id = p_ticket_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Ticket not found'
        );
    END IF;

    -- Update ticket
    UPDATE tickets
    SET 
        assignee_id = p_assignee_id,
        status = 'in_progress',
        updated_at = NOW()
    WHERE id = p_ticket_id;

    -- Add assignment log as internal comment
    INSERT INTO ticket_comments (ticket_id, user_id, content, is_internal)
    VALUES (
        p_ticket_id, 
        p_admin_id, 
        'Tiket ditugaskan ke ' || v_assignee_name,
        true
    );

    v_result := jsonb_build_object(
        'success', true,
        'ticket_id', p_ticket_id,
        'assignee_id', p_assignee_id,
        'assignee_name', v_assignee_name
    );

    RETURN v_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_ticket_status_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION assign_ticket_atomic TO authenticated;
