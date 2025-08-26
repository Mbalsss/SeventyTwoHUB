import {supabase} from './supabase';
import type {Program} from '../types/applicationType.types';
import {RealtimeChannel} from '@supabase/supabase-js';

/**
 * Fetches all programs with an 'active' status from the database.
 * @returns A promise that resolves to an array of Program objects.
 */
export const fetchActivePrograms = async (): Promise<Program[]> => {
    const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading programs:', error);
        throw error; // Re-throw the error to be handled by the calling component.
    }

    return data || [];
};

/**
 * Sets up a real-time subscription to the 'programs' table.
 * @param callback - The function to execute when a change is detected.
 * @returns The Supabase RealtimeChannel instance.
 */
export const subscribeToProgramChanges = (callback: () => void): RealtimeChannel => {
    return supabase
        .channel('programs_changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'programs',
            },
            (payload) => {
                console.log('Program change detected, reloading data:', payload);
                callback();
            }
        )
        .subscribe();
};