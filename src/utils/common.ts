// src/utils/common.ts

// --- GENERIC VALIDATION ---
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
    // South African phone number validation
    const phoneRegex = /^(\+27|0)[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

// --- GENERIC FORMATTING ---
export const formatCurrency = (amount: number, currency: string = 'ZAR'): string => {
    if (currency === 'ZAR') {
        return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatTimeAgo = (date: string | Date): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return past.toLocaleDateString();
};

// --- GENERIC UTILITIES ---
export const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
};

export const generateReferenceNumber = (prefix: string = 'REF'): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
};

/**
 * CORRECTED: A generic, type-safe debounce function that avoids using 'any'.
 * It uses a generic constraint to ensure the passed 'func' is a function,
 * and 'Parameters<T>' to correctly infer the argument types.
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | undefined;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};


export const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the object URL
};

// --- GENERIC DATA MANIPULATION ---
export const groupBy = <T extends Record<string, any>>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
        const group = String(item[key]);
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {} as Record<string, T[]>);
};

export const chunk = <T>(array: T[], size: number): T[][] => {
    if (size <= 0) {
        throw new Error("Chunk size must be greater than 0.");
    }
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};