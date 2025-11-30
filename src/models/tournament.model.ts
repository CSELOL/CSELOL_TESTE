export interface Tournament {
id: number;
slug?: string | null;
name: string;
description?: string | null;
organizerId?: number | null;
startDate?: string | null;
endDate?: string | null;
timezone?: string | null;
status: string;
maxTeams?: number | null;
createdAt: string;
updatedAt: string;
}