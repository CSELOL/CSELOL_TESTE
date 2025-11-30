export interface User {
id: number;
keycloakId?: string | null;
username?: string | null;
email?: string | null;
fullName?: string | null;
avatarUrl?: string | null;
role: 'user' | 'admin' | 'organizer';
createdAt: string;
updatedAt: string;
}