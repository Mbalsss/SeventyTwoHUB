// src/lib/program.queries.ts

import { supabase } from "../supabaseClient";
import type { ProgramRow, EnrollmentRow, EventRow, MaterialRow } from '../types/programDashboard.types.ts';

/**
 * Fetches the details for a single program.
 * @param programId The ID of the program to fetch.
 * @returns A promise that resolves to the program data or null if not found.
 */
export const getProgramDetails = async (programId: string): Promise<ProgramRow | null> => {
    const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .maybeSingle();

    if (error) {
        console.error('Error loading program details:', error);
        return null;
    }

    return data;
};

/**
 * Fetches a user's enrollment record for a specific program.
 * @param programId The ID of the program.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the enrollment data or null if not found.
 */
export const getUserEnrollment = async (programId: string, userId: string): Promise<EnrollmentRow | null> => {
    const { data, error } = await supabase
        .from('program_enrollments')
        .select('*')
        .eq('program_id', programId)
        .eq('participant_id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error loading user enrollment:', error);
        return null;
    }

    return data;
};

/**
 * Fetches all events for a specific program, ordered by start time.
 * @param programId The ID of the program.
 * @returns A promise that resolves to an array of events.
 */
export const getProgramEvents = async (programId: string): Promise<EventRow[]> => {
    const { data, error } = await supabase
        .from('program_events')
        .select('*')
        .eq('program_id', programId)
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error loading program events:', error);
        return [];
    }

    return data || [];
};

/**
 * Fetches all materials for a specific program, ordered by module number.
 * @param programId The ID of the program.
 * @returns A promise that resolves to an array of materials.
 */
export const getProgramMaterials = async (programId: string): Promise<MaterialRow[]> => {
    const { data, error } = await supabase
        .from('program_materials')
        .select('*')
        .eq('program_id', programId)
        .order('module_number', { ascending: true });

    if (error) {
        console.error('Error loading program materials:', error);
        return [];
    }

    return data || [];
};

/**
 * Marks a material as accessed by a user.
 * Creates or updates the record in the 'material_access' table.
 * @param materialId The ID of the material.
 * @param userId The ID of the user accessing the material.
 * @returns A promise that resolves when the operation is complete.
 */
export const markMaterialAsAccessed = async (materialId: string, userId: string): Promise<void> => {
    const { error } = await supabase
        .from('material_access')
        .upsert({
            material_id: materialId,
            participant_id: userId,
            completion_status: 'viewed'
        });

    if (error) {
        console.error('Error marking material as accessed:', error);
    }
};