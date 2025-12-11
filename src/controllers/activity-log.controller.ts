import { Request, Response } from 'express';
import {
    getActivityLogs,
    getActivityLogsCount,
    getDistinctActions,
    getActivityStats
} from '../services/activity-log.service';

/**
 * GET /api/admin/activity-logs
 * Get paginated activity logs with filtering
 */
export const getActivityLogsController = async (req: Request, res: Response) => {
    try {
        const {
            action,
            actorId,
            targetType,
            targetId,
            startDate,
            endDate,
            search,
            limit = '50',
            offset = '0'
        } = req.query;

        const filters = {
            action: action as string | undefined,
            actorId: actorId as string | undefined,
            targetType: targetType as any,
            targetId: targetId ? parseInt(targetId as string) : undefined,
            startDate: startDate as string | undefined,
            endDate: endDate as string | undefined,
            search: search as string | undefined,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string)
        };

        const [logs, total] = await Promise.all([
            getActivityLogs(filters),
            getActivityLogsCount(filters)
        ]);

        res.json({
            logs,
            total,
            limit: filters.limit,
            offset: filters.offset,
            hasMore: filters.offset + logs.length < total
        });
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
};

/**
 * GET /api/admin/activity-logs/actions
 * Get distinct action types for filter dropdown
 */
export const getActionsController = async (req: Request, res: Response) => {
    try {
        const actions = await getDistinctActions();
        res.json(actions);
    } catch (error) {
        console.error('Error fetching action types:', error);
        res.status(500).json({ error: 'Failed to fetch action types' });
    }
};

/**
 * GET /api/admin/activity-logs/stats
 * Get activity summary stats for dashboard
 */
export const getActivityStatsController = async (req: Request, res: Response) => {
    try {
        const days = parseInt(req.query.days as string) || 7;
        const stats = await getActivityStats(days);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching activity stats:', error);
        res.status(500).json({ error: 'Failed to fetch activity stats' });
    }
};
