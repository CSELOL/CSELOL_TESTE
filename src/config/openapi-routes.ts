import { registry } from './registry';
import { z } from 'zod';
import {
    CreateTournamentSchema,
    CreateTeamSchema,
    CreateMatchSchema,
    TournamentSchema,
    TeamSchema,
    MatchSchema,
    RegistrationSchema,
    StandingSchema,
    UserSchema
} from '../utils/zod-schemas';

// --- TOURNAMENTS ---

registry.registerPath({
    method: 'get',
    path: '/api/tournaments',
    tags: ['Tournaments'],
    summary: 'List all tournaments',
    responses: {
        200: {
            description: 'List of tournaments',
            content: {
                'application/json': {
                    schema: z.array(TournamentSchema)
                }
            }
        }
    }
});

registry.registerPath({
    method: 'get',
    path: '/api/tournaments/{id}',
    tags: ['Tournaments'],
    summary: 'Get tournament by ID',
    parameters: [
        { name: 'id', in: 'path', schema: { type: 'integer' }, required: true }
    ],
    responses: {
        200: {
            description: 'Tournament details',
            content: {
                'application/json': {
                    schema: TournamentSchema
                }
            }
        },
        404: { description: 'Tournament not found' }
    }
});

registry.registerPath({
    method: 'post',
    path: '/api/tournaments',
    tags: ['Tournaments'],
    summary: 'Create a tournament (Admin)',
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateTournamentSchema
                }
            }
        }
    },
    responses: {
        201: {
            description: 'Tournament created',
            content: {
                'application/json': {
                    schema: TournamentSchema
                }
            }
        },
        401: { description: 'Unauthorized' }
    }
});

registry.registerPath({
    method: 'put',
    path: '/api/tournaments/{id}',
    tags: ['Tournaments'],
    summary: 'Update a tournament (Admin)',
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: 'id', in: 'path', schema: { type: 'integer' }, required: true }
    ],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateTournamentSchema.partial()
                }
            }
        }
    },
    responses: {
        200: {
            description: 'Tournament updated',
            content: {
                'application/json': {
                    schema: TournamentSchema
                }
            }
        },
        404: { description: 'Tournament not found' }
    }
});

registry.registerPath({
    method: 'delete',
    path: '/api/tournaments/{id}',
    tags: ['Tournaments'],
    summary: 'Delete a tournament (Admin)',
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: 'id', in: 'path', schema: { type: 'integer' }, required: true }
    ],
    responses: {
        204: { description: 'Tournament deleted' },
        404: { description: 'Tournament not found' }
    }
});

registry.registerPath({
    method: 'get',
    path: '/api/tournaments/{id}/teams',
    tags: ['Tournaments'],
    summary: 'Get registered teams (Admin - Full Details)',
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: 'id', in: 'path', schema: { type: 'integer' }, required: true }
    ],
    responses: {
        200: {
            description: 'List of registered teams with private info',
            content: {
                'application/json': {
                    schema: z.array(TeamSchema.extend({
                        registration_id: z.number(),
                        registration_status: z.string(),
                        payment_proof_url: z.string().nullable(),
                        registered_at: z.string(),
                        roster: z.array(z.any())
                    }))
                }
            }
        }
    }
});

registry.registerPath({
    method: 'get',
    path: '/api/tournaments/{id}/public-teams',
    tags: ['Tournaments'],
    summary: 'Get registered teams (Public)',
    parameters: [
        { name: 'id', in: 'path', schema: { type: 'integer' }, required: true }
    ],
    responses: {
        200: {
            description: 'List of approved teams',
            content: {
                'application/json': {
                    schema: z.array(TeamSchema.pick({ id: true, name: true, tag: true, logo_url: true }))
                }
            }
        }
    }
});

registry.registerPath({
    method: 'get',
    path: '/api/tournaments/{id}/matches',
    tags: ['Tournaments'],
    summary: 'Get tournament matches',
    parameters: [
        { name: 'id', in: 'path', schema: { type: 'integer' }, required: true }
    ],
    responses: {
        200: {
            description: 'List of matches',
            content: {
                'application/json': {
                    schema: z.array(MatchSchema)
                }
            }
        }
    }
});

registry.registerPath({
    method: 'post',
    path: '/api/tournaments/{id}/register',
    tags: ['Tournaments'],
    summary: 'Register team for tournament',
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: 'id', in: 'path', schema: { type: 'integer' }, required: true }
    ],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        payment_proof_url: z.string().url()
                    })
                }
            }
        }
    },
    responses: {
        201: { description: 'Registered successfully' },
        400: { description: 'Bad request' }
    }
});

// --- TEAMS ---

registry.registerPath({
    method: 'post',
    path: '/api/teams',
    tags: ['Teams'],
    summary: 'Create a new team',
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'multipart/form-data': {
                    schema: z.object({
                        name: z.string(),
                        tag: z.string(),
                        description: z.string().optional(),
                        social_media: z.string().optional(),
                        logo: z.any().optional() // Binary
                    })
                }
            }
        }
    },
    responses: {
        201: {
            description: 'Team created',
            content: {
                'application/json': {
                    schema: TeamSchema
                }
            }
        }
    }
});

registry.registerPath({
    method: 'get',
    path: '/api/teams/my-team',
    tags: ['Teams'],
    summary: 'Get my team',
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: 'User team details',
            content: {
                'application/json': {
                    schema: TeamSchema
                }
            }
        }
    }
});

registry.registerPath({
    method: 'get',
    path: '/api/teams/my-team/matches',
    tags: ['Teams'],
    summary: 'Get my team matches',
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: 'List of matches',
            content: {
                'application/json': {
                    schema: z.array(z.any())
                }
            }
        }
    }
});

registry.registerPath({
    method: 'get',
    path: '/api/teams/my-team/tournaments',
    tags: ['Teams'],
    summary: 'Get my team tournaments',
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: 'List of tournaments',
            content: {
                'application/json': {
                    schema: z.array(z.any())
                }
            }
        }
    }
});

registry.registerPath({
    method: 'post',
    path: '/api/teams/join',
    tags: ['Teams'],
    summary: 'Join team by code',
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({ code: z.string() })
                }
            }
        }
    },
    responses: {
        200: { description: 'Joined successfully' }
    }
});

registry.registerPath({
    method: 'post',
    path: '/api/teams/{id}/transfer-ownership',
    tags: ['Teams'],
    summary: 'Transfer team ownership (Captain only)',
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: 'id', in: 'path', schema: { type: 'integer' }, required: true }
    ],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({ newCaptainId: z.string() })
                }
            }
        }
    },
    responses: {
        200: { description: 'Ownership transferred successfully' },
        403: { description: 'Only captain can transfer ownership' }
    }
});


// --- MATCHES ---

registry.registerPath({
    method: 'get',
    path: '/api/matches/{id}',
    tags: ['Matches'],
    summary: 'Get match by ID',
    parameters: [
        { name: 'id', in: 'path', schema: { type: 'integer' }, required: true }
    ],
    responses: {
        200: {
            description: 'Match details',
            content: {
                'application/json': {
                    schema: MatchSchema
                }
            }
        }
    }
});

// --- USERS ---

registry.registerPath({
    method: 'get',
    path: '/api/users/me',
    tags: ['Users'],
    summary: 'Get my profile (including role)',
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: 'User profile with role',
            content: {
                'application/json': {
                    schema: UserSchema
                }
            }
        },
        404: { description: 'User not found' }
    }
});

// --- FILES ---

registry.registerPath({
    method: 'post',
    path: '/api/files/upload',
    tags: ['Files'],
    summary: 'Upload file (Admin)',
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'multipart/form-data': {
                    schema: z.object({
                        file: z.any()
                    })
                }
            }
        }
    },
    responses: {
        200: { description: 'File uploaded' }
    }
});
