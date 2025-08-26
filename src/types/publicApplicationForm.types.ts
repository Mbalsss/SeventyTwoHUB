// Core data structures for the form itself
export interface Program {
    id: string;
    name: string;
    description: string;
    application_deadline?: string;
}

export interface FormField {
    id: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'file';
    label: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
}

export interface ApplicationForm {
    id: string;
    program_id: string;
    is_active: boolean;
    form_config: {
        fields: FormField[];
    };
}

// Type for the dynamic form data object
export type FormData = Record<string, string | number>;

// Payloads for creating records in the database
export interface BusinessDataPayload {
    owner_id: string;
    business_name?: string | number;
    business_category?: string | number;
    // ... other business fields
}

// Matches the exact structure for submitting a program application
export interface ProgramApplicationPayload {
    program_id: string;
    applicant_id: string;
    business_id: string;
    application_data: FormData & {
        // Store uploaded files mapping as a JSON string to satisfy index signature constraints
        uploaded_files: string;
    };
}