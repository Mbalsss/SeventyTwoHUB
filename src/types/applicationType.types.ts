export interface Program {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'archived';
    start_date?: string;
    application_deadline?: string;
    max_participants?: number;
    created_at: string;
}