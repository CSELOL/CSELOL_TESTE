import { db } from '../config/database';

// Activity action types for type safety
export type ActivityAction =
    // Team actions
    | 'team.create'
    | 'team.join'
    | 'team.leave'
    | 'team.delete'
    | 'team.transfer_ownership'
    | 'team.update'
    | 'team.refresh_invite_code'
    // Tournament actions
    | 'tournament.create'
    | 'tournament.update'
    | 'tournament.delete'
    | 'tournament.register'
    | 'tournament.approve_registration'
    | 'tournament.reject_registration'
    | 'tournament.withdraw_registration'
    | 'tournament.generate_matches'
    | 'tournament.assign_groups'
    // Match actions
    | 'match.create'
    | 'match.update_score'
    | 'match.complete'
    | 'match.delete'
    // User actions
    | 'user.login'
    | 'user.update_profile'
    | 'user.soft_delete'
    | 'user.onboard'
    // Admin actions
    | 'admin.update_user_role'
    | 'admin.bulk_action';

export type TargetType = 'team' | 'tournament' | 'match' | 'user' | 'registration' | 'system';

export interface LogActivityParams {
    action: ActivityAction;
    actorId?: string | null;        // supabase_id
    actorNickname?: string | null;
    actorRole?: string | null;
    targetType?: TargetType;
    targetId?: number | null;
    targetName?: string | null;
    metadata?: Record<string, any>;
    ipAddress?: string | null;
    userAgent?: string | null;
}

/**
 * Log an activity to the activity_logs table.
 * This is a fire-and-forget function - errors are logged but don't throw.
 */
export const logActivity = async (params: LogActivityParams): Promise<void> => {
    try {
        await db.query(
            `INSERT INTO activity_logs 
       (action, actor_id, actor_nickname, actor_role, target_type, target_id, target_name, metadata, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                params.action,
                params.actorId || null,
                params.actorNickname || null,
                params.actorRole || 'user',
                params.targetType || null,
                params.targetId || null,
                params.targetName || null,
                JSON.stringify(params.metadata || {}),
                params.ipAddress || null,
                params.userAgent || null
            ]
        );
    } catch (error) {
        // Log error but don't throw - activity logging should never break main operations
        console.error('Failed to log activity:', error);
    }
};

export interface ActivityLogFilters {
    action?: string;
    actorId?: string;
    targetType?: TargetType;
    targetId?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

/**
 * Get activity logs with filtering and pagination (Admin only)
 */
export const getActivityLogs = async (filters: ActivityLogFilters = {}) => {
    const {
        action,
        actorId,
        targetType,
        targetId,
        startDate,
        endDate,
        search,
        limit = 50,
        offset = 0
    } = filters;

    let query = `
    SELECT * FROM activity_logs
    WHERE 1=1
  `;
    const values: any[] = [];
    let paramIndex = 1;

    if (action) {
        query += ` AND action = $${paramIndex++}`;
        values.push(action);
    }

    if (actorId) {
        query += ` AND actor_id = $${paramIndex++}`;
        values.push(actorId);
    }

    if (targetType) {
        query += ` AND target_type = $${paramIndex++}`;
        values.push(targetType);
    }

    if (targetId) {
        query += ` AND target_id = $${paramIndex++}`;
        values.push(targetId);
    }

    if (startDate) {
        query += ` AND created_at >= $${paramIndex++}`;
        values.push(startDate);
    }

    if (endDate) {
        query += ` AND created_at <= $${paramIndex++}`;
        values.push(endDate);
    }

    if (search) {
        query += ` AND (
      action ILIKE $${paramIndex} OR
      actor_nickname ILIKE $${paramIndex} OR
      target_name ILIKE $${paramIndex} OR
      metadata::text ILIKE $${paramIndex}
    )`;
        values.push(`%${search}%`);
        paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    const result = await db.query(query, values);
    return result.rows;
};

/**
 * Get activity log count for pagination
 */
export const getActivityLogsCount = async (filters: ActivityLogFilters = {}) => {
    const { action, actorId, targetType, targetId, startDate, endDate, search } = filters;

    let query = `SELECT COUNT(*) FROM activity_logs WHERE 1=1`;
    const values: any[] = [];
    let paramIndex = 1;

    if (action) {
        query += ` AND action = $${paramIndex++}`;
        values.push(action);
    }

    if (actorId) {
        query += ` AND actor_id = $${paramIndex++}`;
        values.push(actorId);
    }

    if (targetType) {
        query += ` AND target_type = $${paramIndex++}`;
        values.push(targetType);
    }

    if (targetId) {
        query += ` AND target_id = $${paramIndex++}`;
        values.push(targetId);
    }

    if (startDate) {
        query += ` AND created_at >= $${paramIndex++}`;
        values.push(startDate);
    }

    if (endDate) {
        query += ` AND created_at <= $${paramIndex++}`;
        values.push(endDate);
    }

    if (search) {
        query += ` AND (
      action ILIKE $${paramIndex} OR
      actor_nickname ILIKE $${paramIndex} OR
      target_name ILIKE $${paramIndex} OR
      metadata::text ILIKE $${paramIndex}
    )`;
        values.push(`%${search}%`);
        paramIndex++;
    }

    const result = await db.query(query, values);
    return parseInt(result.rows[0].count, 10);
};

/**
 * Get distinct action types (for filter dropdowns)
 */
export const getDistinctActions = async () => {
    const result = await db.query(
        `SELECT DISTINCT action FROM activity_logs ORDER BY action`
    );
    return result.rows.map((row: any) => row.action);
};

/**
 * Get activity summary stats (for dashboard)
 */
export const getActivityStats = async (days: number = 7) => {
    const result = await db.query(
        `SELECT 
       target_type,
       COUNT(*) as count,
       COUNT(DISTINCT actor_id) as unique_actors
     FROM activity_logs
     WHERE created_at >= NOW() - INTERVAL '${days} days'
     GROUP BY target_type
     ORDER BY count DESC`
    );
    return result.rows;
};
