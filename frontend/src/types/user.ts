// User-related types
export interface User {
    userId: string;
    createdAt: string;
    lastLoginAt: string;
    facebookConnected: boolean;
    preferences: UserPreferences;
}

export interface UserPreferences {
    maxNodes: 6 | 9 | 12;
    updateFrequency: 'startup' | 'daily' | 'manual';
    displayMode: 'minimal' | 'label_emphasis';
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
    maxNodes: 12,
    updateFrequency: 'daily',
    displayMode: 'minimal',
};
