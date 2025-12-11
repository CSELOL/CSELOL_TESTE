import { Router } from 'express';
import { jwtAuth, checkRole } from '../middlewares/auth.middleware';
import {
    getActivityLogsController,
    getActionsController,
    getActivityStatsController
} from '../controllers/activity-log.controller';

const router = Router();

/**
 * @swagger
 * /admin/activity-logs:
 *   get:
 *     summary: Get paginated activity logs with filtering
 *     tags: [Admin - Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type (e.g., 'team.create')
 *       - in: query
 *         name: actorId
 *         schema:
 *           type: string
 *         description: Filter by actor's supabase_id
 *       - in: query
 *         name: targetType
 *         schema:
 *           type: string
 *           enum: [team, tournament, match, user, registration, system]
 *         description: Filter by target entity type
 *       - in: query
 *         name: targetId
 *         schema:
 *           type: integer
 *         description: Filter by target entity ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs until this date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in action, actor, target, or metadata
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of results per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset for pagination
 *     responses:
 *       200:
 *         description: Paginated activity logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *                 hasMore:
 *                   type: boolean
 *       403:
 *         description: Admin access required
 */
router.get('/', jwtAuth, checkRole(['admin']), getActivityLogsController);

/**
 * @swagger
 * /admin/activity-logs/actions:
 *   get:
 *     summary: Get distinct action types for filter dropdown
 *     tags: [Admin - Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of action types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/actions', jwtAuth, checkRole(['admin']), getActionsController);

/**
 * @swagger
 * /admin/activity-logs/stats:
 *   get:
 *     summary: Get activity summary stats for dashboard
 *     tags: [Admin - Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to aggregate
 *     responses:
 *       200:
 *         description: Activity stats grouped by target type
 */
router.get('/stats', jwtAuth, checkRole(['admin']), getActivityStatsController);

export default router;
