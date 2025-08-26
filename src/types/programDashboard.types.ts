// src/types.ts

/**
 * Defines the structure for a Program.
 */
export interface ProgramRow {
    id: string;
    name: string;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
}

/**
 * Defines the structure for a user's enrollment in a program.
 */
export interface EnrollmentRow {
    id: string;
    program_id: string;
    participant_id: string;
    status?: string;
    enrolled_at: string;
    completion_percentage?: number;
}

/**
 * Defines the structure for a program event.
 */
export interface EventRow {
    id: string;
    title: string;
    description?: string | null;
    start_time: string;
    end_time?: string | null;
    location?: string | null;
    zoom_link?: string | null;
    is_mandatory?: boolean;
}

/**
 * Defines the structure for a program's training material.
 */
export interface MaterialRow {
    id: string;
    title: string;
    description?: string | null;
    module_number?: number | null;
    material_type?: 'video' | 'pdf' | 'document' | null;
    url?: string | null;
    file_size?: number | null;
    is_required?: boolean;
    accessed?: boolean; // This field might come from a JOIN or be added client-side
}