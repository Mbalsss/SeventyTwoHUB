import { getUserProfile, getUserBusiness } from './supabase'; // Assuming these functions exist in your supabase lib file
import type {ProfileData} from '../types/profile.types';
import type {User} from '@supabase/supabase-js';

/**
 * Fetches both the user's profile and business data and combines them into a single object.
 * @param user - The authenticated Supabase user object.
 * @returns A promise that resolves to a ProfileData object.
 */
export const fetchCombinedProfileData = async (user: User): Promise<ProfileData> => {
    try {
        const profile = await getUserProfile(user.id);

        // Business data is optional, so we wrap it in a try-catch block.
        let business = null;
        try {
            business = await getUserBusiness(user.id);
        } catch (error) {
            console.log('No business data found for this user.', error);
        }

        // Map the raw data to the ProfileData interface.
        return {
            name: profile?.full_name || '',
            email: user.email || '',
            phone: profile?.mobile_number || '',
            company: business?.business_name || '',
            industry: business?.business_category || 'Technology',
            location: business?.business_location || '',
            founded: business?.created_at ? new Date(business?.created_at).getFullYear().toString() : '2020',
            employees: business?.number_of_employees || '1 (Just me)',
        };
    } catch (error) {
        console.error('Error fetching combined user data:', error);
        // Re-throw the error to be caught by the component.
        throw error;
    }
};