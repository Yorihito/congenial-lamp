// User model for Table Storage
export interface User {
    partitionKey: string; // 'user'
    rowKey: string; // userId (UUID)
    azureAdOid: string;
    facebookUserId?: string;
    facebookAccessToken?: string;
    facebookTokenExpiry?: Date;
    locale: string;
    createdAt: Date;
    lastLoginAt: Date;
    preferences: string; // JSON stringified UserPreferences
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

// API response types
export interface UserResponse {
    userId: string;
    createdAt: string;
    lastLoginAt: string;
    facebookConnected: boolean;
    preferences: UserPreferences;
}

export interface UserInitRequest {
    facebookUserId?: string;
    facebookAccessToken?: string;
    locale?: string;
}

export interface UserPreferencesUpdateRequest {
    maxNodes?: 6 | 9 | 12;
    updateFrequency?: 'startup' | 'daily' | 'manual';
    displayMode?: 'minimal' | 'label_emphasis';
}
