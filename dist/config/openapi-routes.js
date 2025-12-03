"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("./registry");
const zod_1 = require("zod");
const zod_schemas_1 = require("../utils/zod-schemas");
// --- TOURNAMENTS ---
registry_1.registry.registerPath({
    method: 'get',
    path: '/api/tournaments',
    tags: ['Tournaments'],
    summary: 'List all tournaments',
    responses: {
        200: {
            description: 'List of tournaments',
            content: {
                'application/json': {
                    schema: zod_1.z.array(zod_schemas_1.TournamentSchema)
                }
            }
        }
    }
});
registry_1.registry.registerPath({
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
                    schema: zod_schemas_1.TournamentSchema
                }
            }
        },
        404: { description: 'Tournament not found' }
    }
});
registry_1.registry.registerPath({
    method: 'post',
    path: '/api/tournaments',
    tags: ['Tournaments'],
    summary: 'Create a tournament (Admin)',
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: zod_schemas_1.CreateTournamentSchema
                }
            }
        }
    },
    responses: {
        201: {
            description: 'Tournament created',
            content: {
                'application/json': {
                    schema: zod_schemas_1.TournamentSchema
                }
            }
        },
        401: { description: 'Unauthorized' }
    }
});
registry_1.registry.registerPath({
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
                    schema: zod_schemas_1.CreateTournamentSchema.partial()
                }
            }
        }
    },
    responses: {
        200: {
            description: 'Tournament updated',
            content: {
                'application/json': {
                    schema: zod_schemas_1.TournamentSchema
                }
            }
        },
        404: { description: 'Tournament not found' }
    }
});
registry_1.registry.registerPath({
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
registry_1.registry.registerPath({
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
                    schema: zod_1.z.array(zod_schemas_1.TeamSchema.extend({
                        registration_id: zod_1.z.number(),
                        registration_status: zod_1.z.string(),
                        payment_proof_url: zod_1.z.string().nullable(),
                        registered_at: zod_1.z.string(),
                        roster: zod_1.z.array(zod_1.z.any())
                    }))
                }
            }
        }
    }
});
registry_1.registry.registerPath({
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
                    schema: zod_1.z.array(zod_schemas_1.TeamSchema.pick({ id: true, name: true, tag: true, logo_url: true }))
                }
            }
        }
    }
});
registry_1.registry.registerPath({
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
                    schema: zod_1.z.array(zod_schemas_1.MatchSchema)
                }
            }
        }
    }
});
registry_1.registry.registerPath({
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
                    schema: zod_1.z.object({
                        payment_proof_url: zod_1.z.string().url()
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
registry_1.registry.registerPath({
    method: 'post',
    path: '/api/teams',
    tags: ['Teams'],
    summary: 'Create a new team',
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'multipart/form-data': {
                    schema: zod_1.z.object({
                        name: zod_1.z.string(),
                        tag: zod_1.z.string(),
                        description: zod_1.z.string().optional(),
                        social_media: zod_1.z.string().optional(),
                        logo: zod_1.z.any().optional() // Binary
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
                    schema: zod_schemas_1.TeamSchema
                }
            }
        }
    }
});
registry_1.registry.registerPath({
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
                    schema: zod_schemas_1.TeamSchema
                }
            }
        }
    }
});
registry_1.registry.registerPath({
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
                    schema: zod_1.z.array(zod_1.z.any())
                }
            }
        }
    }
});
registry_1.registry.registerPath({
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
                    schema: zod_1.z.array(zod_1.z.any())
                }
            }
        }
    }
});
registry_1.registry.registerPath({
    method: 'post',
    path: '/api/teams/join',
    tags: ['Teams'],
    summary: 'Join team by code',
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: zod_1.z.object({ code: zod_1.z.string() })
                }
            }
        }
    },
    responses: {
        200: { description: 'Joined successfully' }
    }
});
registry_1.registry.registerPath({
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
                    schema: zod_1.z.object({ newCaptainId: zod_1.z.string() })
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
registry_1.registry.registerPath({
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
                    schema: zod_schemas_1.MatchSchema
                }
            }
        }
    }
});
// --- PLAYERS ---
registry_1.registry.registerPath({
    method: 'post',
    path: '/api/players',
    tags: ['Players'],
    summary: 'Create player profile',
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: zod_schemas_1.CreatePlayerSchema
                }
            }
        }
    },
    responses: {
        201: {
            description: 'Profile created',
            content: {
                'application/json': {
                    schema: zod_schemas_1.UserSchema
                }
            }
        }
    }
});
registry_1.registry.registerPath({
    method: 'get',
    path: '/api/players/me',
    tags: ['Players'],
    summary: 'Get my profile',
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: 'User profile',
            content: {
                'application/json': {
                    schema: zod_schemas_1.UserSchema
                }
            }
        }
    }
});
// --- FILES ---
registry_1.registry.registerPath({
    method: 'post',
    path: '/api/files/upload',
    tags: ['Files'],
    summary: 'Upload file (Admin)',
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'multipart/form-data': {
                    schema: zod_1.z.object({
                        file: zod_1.z.any()
                    })
                }
            }
        }
    },
    responses: {
        200: { description: 'File uploaded' }
    }
});
//# sourceMappingURL=openapi-routes.js.map